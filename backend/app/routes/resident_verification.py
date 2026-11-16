"""
app/routes/resident_verification.py
Village Resident Verification routes for citizens.
Supports:
  1. Instant verification using Panchayat-issued verification codes.
  2. Local document / officer review request (with optional privacy-masked proof).
  3. Status inquiry.
"""

from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import get_db
from app.services.image_service import upload_image
from app.utils.helpers import success_response, error_response

resident_verification_bp = Blueprint("resident_verification", __name__)

ALLOWED_PROOF_TYPES = [
    "Ration Card",
    "Electricity Bill",
    "House Tax Receipt",
    "Voter ID",
    "Panchayat Resident Certificate",
    "Self Declaration"
]


# ─────────────────────────────────────────────
# GET /api/resident-verification/status
# Get current citizen's verification status
# ─────────────────────────────────────────────
@resident_verification_bp.route("/status", methods=["GET"])
@jwt_required()
def get_verification_status():
    identity = get_jwt_identity()
    user_id = identity["user_id"]

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """SELECT user_id, name, mobile, residency_status,
                      residency_ward_id, residency_address, verified_at,
                      verification_remarks
               FROM users WHERE user_id = %s""",
            (user_id,)
        )
        user = cursor.fetchone()

        if not user:
            return error_response("User not found", 404)

        # Get the latest verification request if any
        cursor.execute(
            """SELECT request_id, ward_id, address, proof_type,
                      proof_masked_id, proof_url, status, review_remarks,
                      reviewed_at, created_at
               FROM resident_verification_requests
               WHERE user_id = %s
               ORDER BY created_at DESC LIMIT 1""",
            (user_id,)
        )
        latest_request = cursor.fetchone()

    return success_response(data={
        "residency_status": user.get("residency_status") or "unverified",
        "is_verified": user.get("residency_status") == "verified",
        "ward_id": user.get("residency_ward_id"),
        "address": user.get("residency_address"),
        "verified_at": user.get("verified_at"),
        "verification_remarks": user.get("verification_remarks"),
        "latest_request": latest_request
    })


# ─────────────────────────────────────────────
# POST /api/resident-verification/request
# Submit details for Panchayat officer review
# ─────────────────────────────────────────────
@resident_verification_bp.route("/request", methods=["POST"])
@jwt_required()
def request_verification():
    identity = get_jwt_identity()
    user_id = identity["user_id"]

    # Support JSON and multipart/form-data
    if request.content_type and "multipart/form-data" in request.content_type:
        ward_id = request.form.get("ward_id")
        address = request.form.get("address", "").strip()
        proof_type = request.form.get("proof_type", "").strip() or "Self Declaration"
        proof_masked_id = request.form.get("proof_masked_id", "").strip()
        proof_file = request.files.get("proof_file")
    else:
        data = request.get_json(silent=True) or {}
        ward_id = data.get("ward_id")
        address = (data.get("address") or "").strip()
        proof_type = (data.get("proof_type") or "").strip() or "Self Declaration"
        proof_masked_id = (data.get("proof_masked_id") or "").strip()
        proof_file = None

    errors = []
    if not ward_id:
        errors.append("Ward number is required (1 to 5)")
    else:
        try:
            ward_id = int(ward_id)
            if ward_id < 1 or ward_id > 5:
                errors.append("Ward number must be between 1 and 5")
        except ValueError:
            errors.append("Invalid ward number")

    if not address or len(address) < 5:
        errors.append("Residential address in Vemavaram is required (minimum 5 characters)")

    # Strict privacy safeguard: Never accept 12-digit Aadhaar number
    if proof_masked_id:
        digits_only = "".join(filter(str.isdigit, proof_masked_id))
        if len(digits_only) == 12:
            return error_response(
                "For privacy and legal compliance, complete Aadhaar numbers must not be submitted. "
                "Please only provide the last 4 digits (e.g. XXXX-XXXX-1234) or use a Ration Card/Electricity Bill.",
                422
            )

    if errors:
        return error_response("Validation failed", 422, errors)

    db = get_db()
    with db.cursor() as cursor:
        # Check current status
        cursor.execute("SELECT residency_status FROM users WHERE user_id = %s", (user_id,))
        user_row = cursor.fetchone()
        if user_row and user_row.get("residency_status") == "verified":
            return error_response("You are already verified as a Vemavaram Village resident", 400)

        # Upload proof document to Cloudinary if provided
        proof_url = None
        if proof_file and proof_file.filename:
            try:
                proof_bytes = proof_file.read()
                proof_url = upload_image(proof_bytes, proof_file.filename, folder="resident_proofs")
            except Exception as e:
                return error_response(f"Proof document upload failed: {str(e)}", 500)

        # Insert new verification request
        cursor.execute(
            """INSERT INTO resident_verification_requests
               (user_id, ward_id, address, proof_type, proof_masked_id, proof_url, status)
               VALUES (%s, %s, %s, %s, %s, %s, 'pending')""",
            (user_id, ward_id, address, proof_type, proof_masked_id or None, proof_url)
        )
        request_id = cursor.lastrowid

        # Update user status to pending
        cursor.execute(
            """UPDATE users
               SET residency_status = 'pending',
                   residency_ward_id = %s,
                   residency_address = %s
               WHERE user_id = %s""",
            (ward_id, address, user_id)
        )
    db.commit()

    return success_response(
        data={
            "request_id": request_id,
            "residency_status": "pending",
            "ward_id": ward_id,
            "address": address,
            "proof_type": proof_type,
            "proof_url": proof_url
        },
        message="Resident verification request submitted successfully. Awaiting Panchayat review.",
        status_code=201
    )


# ─────────────────────────────────────────────
# POST /api/resident-verification/verify-code
# Instant verification via Panchayat verification code
# ─────────────────────────────────────────────
@resident_verification_bp.route("/verify-code", methods=["POST"])
@jwt_required()
def verify_code():
    identity = get_jwt_identity()
    user_id = identity["user_id"]

    data = request.get_json(silent=True) or {}
    code = (data.get("code") or "").strip().upper()

    if not code:
        return error_response("Verification code is required", 422)

    db = get_db()
    with db.cursor() as cursor:
        # Check current user
        cursor.execute("SELECT residency_status FROM users WHERE user_id = %s", (user_id,))
        user_row = cursor.fetchone()
        if user_row and user_row.get("residency_status") == "verified":
            return error_response("You are already verified as a Vemavaram Village resident", 400)

        # Check code validity
        cursor.execute(
            """SELECT * FROM village_verification_codes
               WHERE code = %s AND is_used = 0
                 AND (expires_at IS NULL OR expires_at > NOW())""",
            (code,)
        )
        code_entry = cursor.fetchone()

        if not code_entry:
            return error_response(
                "Invalid, expired, or already used village verification code. "
                "Please check the code issued by the Panchayat or request officer verification.",
                404
            )

        ward_id = code_entry["ward_id"]

        # Mark code as used
        cursor.execute(
            """UPDATE village_verification_codes
               SET is_used = 1, used_by = %s, used_at = NOW()
               WHERE code_id = %s""",
            (user_id, code_entry["code_id"])
        )

        # Update user status to verified
        remarks = f"Instant verification via Panchayat code {code}"
        cursor.execute(
            """UPDATE users
               SET residency_status = 'verified',
                   residency_ward_id = %s,
                   verified_at = NOW(),
                   verification_remarks = %s
               WHERE user_id = %s""",
            (ward_id, remarks, user_id)
        )

        # Mark any existing pending requests as approved
        cursor.execute(
            """UPDATE resident_verification_requests
               SET status = 'approved',
                   review_remarks = %s,
                   reviewed_at = NOW()
               WHERE user_id = %s AND status = 'pending'""",
            (remarks, user_id)
        )
    db.commit()

    return success_response(
        data={
            "residency_status": "verified",
            "ward_id": ward_id,
            "verification_method": "panchayat_code"
        },
        message="Residency verified successfully! You now have verified resident priority on all complaints."
    )

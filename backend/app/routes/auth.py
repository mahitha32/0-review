"""
app/routes/auth.py
Unified authentication routes for Citizens, Workers, and Admins.
Village Complaint Redressal System - Vemavaram Village

Roles:
  - citizen : Web registration/login OR Mobile Firebase Phone Auth
  - worker  : Created by admin, logs in with mobile + password
  - admin   : System admin, logs in with mobile + password
"""

import random
from datetime import datetime, timedelta
import bcrypt
from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from app import get_db
from app.services.firebase_service import verify_firebase_token
from app.utils.helpers import (
    validate_mobile, normalize_mobile,
    success_response, error_response
)

auth_bp = Blueprint("auth", __name__)


# ─────────────────────────────────────────────
# POST /api/auth/send-otp
# Send SMS OTP for mobile verification
# ─────────────────────────────────────────────
@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    data    = request.get_json(silent=True) or {}
    mobile  = normalize_mobile(data.get("mobile", "").strip())
    purpose = data.get("purpose", "registration")
    if purpose not in ("registration", "login", "forgot_password"):
        purpose = "registration"

    if not mobile or not validate_mobile(mobile):
        return error_response("Valid 10-digit mobile number is required", 422)

    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.now() + timedelta(minutes=10)

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """INSERT INTO otp_sessions (mobile, otp_code, purpose, is_used, attempts, expires_at)
               VALUES (%s, %s, %s, 0, 0, %s)""",
            (mobile, otp_code, purpose, expires_at)
        )
    db.commit()

    return success_response(
        data={
            "mobile": mobile,
            "purpose": purpose,
            "expires_in": 600,
            "otp_code": otp_code
        },
        message=f"OTP sent successfully to {mobile}"
    )


# ─────────────────────────────────────────────
# POST /api/auth/verify-otp
# Verify mobile OTP code
# ─────────────────────────────────────────────
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data     = request.get_json(silent=True) or {}
    mobile   = normalize_mobile(data.get("mobile", "").strip())
    otp_code = (data.get("otp_code") or "").strip()
    purpose  = data.get("purpose", "registration")

    if not mobile or not otp_code:
        return error_response("Mobile and OTP code are required", 422)

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """SELECT * FROM otp_sessions
               WHERE mobile = %s AND purpose = %s AND is_used = 0
               ORDER BY created_at DESC LIMIT 1""",
            (mobile, purpose)
        )
        session = cursor.fetchone()

        if not session:
            return error_response("No active OTP request found. Please request an OTP first.", 404)

        if session["expires_at"] < datetime.now():
            return error_response("OTP has expired. Please request a new OTP.", 400)

        if session["otp_code"] != otp_code:
            cursor.execute(
                "UPDATE otp_sessions SET attempts = attempts + 1 WHERE session_id = %s",
                (session["session_id"],)
            )
            db.commit()
            return error_response("Invalid OTP code. Please enter the correct 6-digit code.", 400)

        # Mark OTP as used
        cursor.execute(
            "UPDATE otp_sessions SET is_used = 1 WHERE session_id = %s",
            (session["session_id"],)
        )
    db.commit()

    return success_response(
        data={"verified": True, "mobile": mobile},
        message="Mobile number verified successfully"
    )


# ─────────────────────────────────────────────
# POST /api/auth/register
# Citizen web/app registration (mobile + password + residency verification)
# ─────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    data     = request.get_json(silent=True) or {}
    name     = data.get("name", "").strip()
    mobile   = normalize_mobile(data.get("mobile", "").strip())
    password = data.get("password", "").strip()
    village  = data.get("village", "Vemavaram").strip() or "Vemavaram"

    # Residency declaration & verification inputs
    resides_in_village = data.get("resides_in_village")
    if isinstance(resides_in_village, str):
        resides_in_village = resides_in_village.lower() in ("true", "1", "yes")
    elif resides_in_village is None:
        resides_in_village = True
    else:
        resides_in_village = bool(resides_in_village)

    ward_id           = data.get("ward_id")
    address           = (data.get("address") or "").strip()
    verification_code = (data.get("verification_code") or "").strip().upper()

    errors = []
    if not name:
        errors.append("Name is required")
    if not mobile:
        errors.append("Mobile number is required")
    elif not validate_mobile(mobile):
        errors.append("Invalid mobile number format")
    if not password or len(password) < 6:
        errors.append("Password must be at least 6 characters")

    if errors:
        return error_response("Validation failed", 422, errors)

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("SELECT user_id FROM users WHERE mobile = %s", (mobile,))
        if cursor.fetchone():
            return error_response("A user with this mobile number already exists", 409)

        residency_status = "unverified"
        verified_at = None
        verification_remarks = None
        code_entry = None

        if verification_code:
            cursor.execute(
                """SELECT * FROM village_verification_codes
                   WHERE code = %s AND is_used = 0
                     AND (expires_at IS NULL OR expires_at > NOW())""",
                (verification_code,)
            )
            code_entry = cursor.fetchone()
            if not code_entry:
                return error_response("Invalid or already used village verification code", 400)
            residency_status = "verified"
            ward_id = code_entry["ward_id"]
            verified_at = datetime.now()
            verification_remarks = f"Instant verification via code {verification_code}"
        elif resides_in_village and ward_id and address:
            residency_status = "pending"
            verification_remarks = "Residency declaration submitted during registration"

        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        cursor.execute(
            """INSERT INTO users (name, mobile, village, password_hash, role,
                                 residency_status, residency_ward_id, residency_address,
                                 verified_at, verification_remarks)
               VALUES (%s, %s, %s, %s, 'citizen', %s, %s, %s, %s, %s)""",
            (name, mobile, village, hashed, residency_status,
             ward_id or None, address or None, verified_at, verification_remarks)
        )
        user_id = cursor.lastrowid

        # Mark code as used if verified via code
        if code_entry:
            cursor.execute(
                "UPDATE village_verification_codes SET is_used = 1, used_by = %s, used_at = NOW() WHERE code_id = %s",
                (user_id, code_entry["code_id"])
            )

        # If pending with address, create a verification request
        if residency_status == "pending" and ward_id and address:
            cursor.execute(
                """INSERT INTO resident_verification_requests
                   (user_id, ward_id, address, proof_type, status)
                   VALUES (%s, %s, %s, 'Self Declaration', 'pending')""",
                (user_id, ward_id, address)
            )

    db.commit()

    identity = {"user_id": user_id, "role": "citizen", "mobile": mobile}
    access_token  = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)

    return success_response(
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "user_id": user_id,
                "name": name,
                "mobile": mobile,
                "role": "citizen",
                "village": village,
                "residency_status": residency_status,
                "is_verified_resident": residency_status == "verified",
                "ward_id": ward_id,
                "address": address,
            }
        },
        message="Registration successful" + (" and verified as Vemavaram resident!" if residency_status == "verified" else ""),
        status_code=201
    )


# ─────────────────────────────────────────────
# POST /api/auth/login
# Citizen web/app login (mobile + password)
# ─────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def citizen_login():
    data     = request.get_json(silent=True) or {}
    mobile   = normalize_mobile(data.get("mobile", "").strip())
    password = data.get("password", "").encode("utf-8")

    if not mobile or not password:
        return error_response("Mobile and password are required")

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """SELECT * FROM users
               WHERE mobile = %s AND role IN ('citizen', 'villager') AND is_active = 1""",
            (mobile,)
        )
        user = cursor.fetchone()

    if not user:
        return error_response("Invalid credentials", 401)

    stored_hash = user["password_hash"].encode("utf-8")
    if not bcrypt.checkpw(password, stored_hash):
        return error_response("Invalid credentials", 401)

    role = "citizen"
    identity = {"user_id": user["user_id"], "role": role, "mobile": mobile}
    access_token  = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)

    return success_response(
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "user_id": user["user_id"],
                "name": user["name"],
                "mobile": mobile,
                "role": role,
                "village": user.get("village", "Vemavaram"),
                "residency_status": user.get("residency_status") or "unverified",
                "is_verified_resident": user.get("residency_status") == "verified",
                "ward_id": user.get("residency_ward_id"),
                "address": user.get("residency_address"),
            }
        },
        message="Login successful"
    )


# ─────────────────────────────────────────────
# POST /api/auth/worker-login
# Worker login with mobile & password
# ─────────────────────────────────────────────
@auth_bp.route("/worker-login", methods=["POST"])
def worker_login():
    data     = request.get_json(silent=True) or {}
    mobile   = normalize_mobile(data.get("mobile", "").strip())
    password = data.get("password", "").encode("utf-8")

    if not mobile or not password:
        return error_response("Mobile and password are required")

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """SELECT u.*, wp.department
               FROM users u
               LEFT JOIN worker_profiles wp ON u.user_id = wp.user_id
               WHERE u.mobile = %s AND u.role = 'worker' AND u.is_active = 1""",
            (mobile,)
        )
        worker = cursor.fetchone()

    if not worker:
        return error_response("Invalid worker credentials", 401)

    stored_hash = worker["password_hash"].encode("utf-8")
    if not bcrypt.checkpw(password, stored_hash):
        return error_response("Invalid worker credentials", 401)

    identity = {"user_id": worker["user_id"], "role": "worker", "mobile": mobile}
    access_token  = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)

    return success_response(
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "user_id": worker["user_id"],
                "name": worker["name"],
                "mobile": mobile,
                "role": "worker",
                "department": worker.get("department", "General Services"),
                "village": worker.get("village", "Vemavaram"),
            }
        },
        message="Worker login successful"
    )


# ─────────────────────────────────────────────
# POST /api/auth/admin-login
# Admin login with mobile & password
# ─────────────────────────────────────────────
@auth_bp.route("/admin-login", methods=["POST"])
def admin_login():
    data     = request.get_json(silent=True) or {}
    raw_mobile = data.get("mobile", "").strip()
    mobile   = normalize_mobile(raw_mobile) if raw_mobile else ""
    email    = data.get("email", "").strip()
    password = data.get("password", "").encode("utf-8")

    if not password or (not mobile and not email):
        return error_response("Mobile or email and password are required")

    db = get_db()
    with db.cursor() as cursor:
        if mobile:
            cursor.execute(
                "SELECT * FROM users WHERE mobile = %s AND role = 'admin' AND is_active = 1",
                (mobile,)
            )
        else:
            cursor.execute(
                "SELECT * FROM users WHERE email = %s AND role = 'admin' AND is_active = 1",
                (email,)
            )
        user = cursor.fetchone()

    if not user:
        return error_response("Invalid admin credentials", 401)

    stored_hash = user["password_hash"].encode("utf-8")
    if not bcrypt.checkpw(password, stored_hash):
        return error_response("Invalid admin credentials", 401)

    identity = {"user_id": user["user_id"], "role": "admin", "mobile": mobile or user.get("mobile")}
    access_token  = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)

    return success_response(
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "user_id": user["user_id"],
                "name": user["name"],
                "mobile": user.get("mobile"),
                "email": user.get("email"),
                "role": "admin",
                "village": user.get("village", "Vemavaram"),
            }
        },
        message="Admin login successful"
    )


# ─────────────────────────────────────────────
# POST /api/auth/firebase-login
# ─────────────────────────────────────────────
@auth_bp.route("/firebase-login", methods=["POST"])
def firebase_login():
    data     = request.get_json(silent=True) or {}
    id_token = data.get("id_token", "").strip()
    name     = data.get("name", "").strip()

    if not id_token:
        return error_response("Firebase ID token is required")

    try:
        decoded = verify_firebase_token(id_token)
    except ValueError as e:
        return error_response(str(e), 401)

    phone = decoded.get("phone_number", "")
    if not phone:
        return error_response("Phone number not found in Firebase token", 400)

    mobile = normalize_mobile(phone)
    db = get_db()

    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM users WHERE mobile = %s", (mobile,))
        user = cursor.fetchone()

        if not user:
            display_name = name or decoded.get("name") or f"Citizen_{mobile[-4:]}"
            dummy_hash = bcrypt.hashpw(b"firebase_auth_citizen", bcrypt.gensalt()).decode("utf-8")
            cursor.execute(
                """INSERT INTO users (name, mobile, village, password_hash, role)
                   VALUES (%s, %s, %s, %s, 'citizen')""",
                (display_name, mobile, "Vemavaram", dummy_hash)
            )
            db.commit()
            user_id = cursor.lastrowid
            role = "citizen"
            user_name = display_name
            village = "Vemavaram"
            residency_status = "unverified"
        else:
            user_id = user["user_id"]
            role = "citizen" if user["role"] == "villager" else user["role"]
            user_name = user["name"]
            village = user.get("village", "Vemavaram")
            residency_status = user.get("residency_status") or "unverified"

    identity = {"user_id": user_id, "role": role, "mobile": mobile}
    access_token  = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)

    return success_response(
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "user_id": user_id,
                "name": user_name,
                "mobile": mobile,
                "role": role,
                "village": village,
                "residency_status": residency_status,
                "is_verified_resident": residency_status == "verified",
            }
        },
        message="Login successful"
    )


# ─────────────────────────────────────────────
# POST /api/auth/refresh
# Refresh access token
# ─────────────────────────────────────────────
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return success_response(data={"access_token": access_token}, message="Token refreshed")


# ─────────────────────────────────────────────
# PUT /api/auth/profile
# Update user profile (name, fcm_token)
# ─────────────────────────────────────────────
@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    identity = get_jwt_identity()
    user_id  = identity["user_id"]
    data     = request.get_json(silent=True) or {}
    name     = data.get("name", "").strip()
    fcm_token = data.get("fcm_token", "").strip()

    if not name and not fcm_token:
        return error_response("Nothing to update")

    db = get_db()
    with db.cursor() as cursor:
        if name and fcm_token:
            cursor.execute(
                "UPDATE users SET name=%s, fcm_token=%s WHERE user_id=%s",
                (name, fcm_token, user_id)
            )
        elif name:
            cursor.execute("UPDATE users SET name=%s WHERE user_id=%s", (name, user_id))
        else:
            cursor.execute("UPDATE users SET fcm_token=%s WHERE user_id=%s", (fcm_token, user_id))
    db.commit()

    return success_response(message="Profile updated successfully")


# ─────────────────────────────────────────────
# GET /api/auth/me
# Get current logged-in user profile
# ─────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    identity = get_jwt_identity()
    user_id  = identity["user_id"]
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """SELECT u.user_id, u.name, u.mobile, u.email, u.village, u.role, u.created_at,
                      u.residency_status, u.residency_ward_id, u.residency_address,
                      u.verified_at, u.verification_remarks,
                      wp.department
               FROM users u
               LEFT JOIN worker_profiles wp ON u.user_id = wp.user_id
               WHERE u.user_id = %s""",
            (user_id,)
        )
        user = cursor.fetchone()

    if not user:
        return error_response("User not found", 404)

    user["is_verified_resident"] = user.get("residency_status") == "verified"
    return success_response(data=user)

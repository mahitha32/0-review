"""
app/routes/admin.py
Admin-only routes: complaints oversight, analytics, worker assignments,
reports, survey insights, public stats, and village resident verification.
Village Complaint Redressal System - Vemavaram Village
"""

import random
import string
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import get_db
from app.services.notification_service import notify_complaint_assigned, notify_status_changed
from app.utils.helpers import success_response, error_response
from app.utils.decorators import admin_required

admin_bp = Blueprint("admin", __name__)


# ─────────────────────────────────────────────
# GET /api/admin/public-stats
# Public statistics for the website (no auth required)
# ─────────────────────────────────────────────
@admin_bp.route("/public-stats", methods=["GET"])
def public_stats():
    """Returns live aggregated statistics for the public landing page."""
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) as total FROM complaints")
        total = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) as resolved FROM complaints WHERE status = 'Resolved'")
        resolved = cursor.fetchone()["resolved"]

        cursor.execute(
            """SELECT COUNT(*) as pending FROM complaints
               WHERE status IN ('Submitted', 'Under Review', 'Assigned', 'In Progress')"""
        )
        pending = cursor.fetchone()["pending"]

        cursor.execute("SELECT AVG(rating) as avg_rating FROM feedback")
        row = cursor.fetchone()
        avg_rating = round(float(row["avg_rating"] or 0), 2)

        cursor.execute(
            """SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_hours
               FROM complaints
               WHERE status = 'Resolved' AND resolved_at IS NOT NULL"""
        )
        row_hours = cursor.fetchone()
        avg_resolution_hours = round(float(row_hours["avg_hours"] or 24))

        cursor.execute("SELECT COUNT(*) as citizens FROM users WHERE role IN ('citizen', 'villager')")
        citizens = cursor.fetchone()["citizens"]

        cursor.execute("SELECT COUNT(*) as verified_residents FROM users WHERE residency_status = 'verified'")
        verified_count = cursor.fetchone()["verified_residents"]

    satisfaction_pct = round((avg_rating / 5) * 100) if avg_rating > 0 else 97

    return success_response(data={
        "total_complaints": total,
        "resolved_complaints": resolved,
        "pending_complaints": pending,
        "avg_resolution_hours": avg_resolution_hours if avg_resolution_hours else 24,
        "citizen_satisfaction": satisfaction_pct,
        "active_citizens": citizens,
        "verified_residents": verified_count,
        "village": "Vemavaram"
    })


# ─────────────────────────────────────────────
# GET /api/admin/complaints
# All complaints with search, filter, and pagination
# ─────────────────────────────────────────────
@admin_bp.route("/complaints", methods=["GET"])
@jwt_required()
@admin_required
def get_all_complaints():
    page      = int(request.args.get("page", 1))
    per_page  = int(request.args.get("per_page", 15))
    status    = request.args.get("status", "")
    category  = request.args.get("category", "")
    search    = request.args.get("search", "")
    priority  = request.args.get("priority", "")
    residency = request.args.get("residency", "").strip()  # 'verified' | 'unverified'
    duplicate = request.args.get("duplicate", "").strip()  # 'suspects' | '1'

    query = """
        SELECT c.*,
               u.name as user_name, u.mobile as user_mobile, u.residency_status as user_residency_status,
               w.name as worker_name, wp.department
        FROM complaints c
        JOIN users u ON c.user_id = u.user_id
        LEFT JOIN assignments a ON c.complaint_id = a.complaint_id AND a.is_current = 1
        LEFT JOIN users w ON a.worker_id = w.user_id
        LEFT JOIN worker_profiles wp ON w.user_id = wp.user_id
        WHERE 1=1
    """
    params = []

    if status:
        query += " AND c.status = %s"
        params.append(status)
    if category:
        query += " AND c.category = %s"
        params.append(category)
    if priority:
        query += " AND c.priority = %s"
        params.append(priority)
    if residency == "verified":
        query += " AND c.is_verified_resident = 1"
    elif residency == "unverified":
        query += " AND c.is_verified_resident = 0"
    if duplicate in ("suspects", "1", "true"):
        query += " AND c.is_duplicate_suspect = 1"

    if search:
        query += " AND (c.complaint_id LIKE %s OR c.title LIKE %s OR u.name LIKE %s OR c.location LIKE %s)"
        like = f"%{search}%"
        params += [like, like, like, like]

    query += " ORDER BY c.created_at DESC"

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(f"SELECT COUNT(*) as total FROM ({query}) sub", params)
        total = cursor.fetchone()["total"]

        offset = (page - 1) * per_page
        cursor.execute(f"{query} LIMIT %s OFFSET %s", params + [per_page, offset])
        complaints = cursor.fetchall()

    return success_response(data={
        "complaints": complaints,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page if per_page else 1
        }
    })


# ─────────────────────────────────────────────
# PUT /api/admin/complaints/<id>/status
# Update complaint status
# ─────────────────────────────────────────────
@admin_bp.route("/complaints/<complaint_id>/status", methods=["PUT"])
@jwt_required()
@admin_required
def update_status(complaint_id):
    identity   = get_jwt_identity()
    data       = request.get_json(silent=True) or {}
    new_status = data.get("status", "").strip()
    notes      = data.get("notes", "").strip()

    valid = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Rejected"]
    if new_status not in valid:
        return error_response(f"Invalid status. Must be one of: {', '.join(valid)}")

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM complaints WHERE complaint_id = %s", (complaint_id,))
        complaint = cursor.fetchone()
        if not complaint:
            return error_response("Complaint not found", 404)

        old_status = complaint["status"]

        if new_status == "Resolved":
            cursor.execute(
                """UPDATE complaints
                   SET status = %s, updated_at = NOW(), resolved_at = NOW()
                   WHERE complaint_id = %s""",
                (new_status, complaint_id)
            )
        else:
            cursor.execute(
                """UPDATE complaints
                   SET status = %s, updated_at = NOW()
                   WHERE complaint_id = %s""",
                (new_status, complaint_id)
            )

        cursor.execute(
            """INSERT INTO complaint_status_history
               (complaint_id, old_status, new_status, changed_by, notes)
               VALUES (%s, %s, %s, %s, %s)""",
            (complaint_id, old_status, new_status, identity["user_id"],
             notes or f"Status changed to {new_status}")
        )
    db.commit()

    notify_status_changed(complaint["user_id"], complaint_id, new_status)
    return success_response(message=f"Complaint status updated to {new_status}")


# ─────────────────────────────────────────────
# POST /api/admin/complaints/<id>/assign
# Assign a worker to a complaint
# ─────────────────────────────────────────────
@admin_bp.route("/complaints/<complaint_id>/assign", methods=["POST"])
@jwt_required()
@admin_required
def assign_worker(complaint_id):
    identity  = get_jwt_identity()
    data      = request.get_json(silent=True) or {}
    worker_id = data.get("worker_id")
    notes     = data.get("notes", "").strip()

    if not worker_id:
        return error_response("worker_id is required")

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM complaints WHERE complaint_id = %s", (complaint_id,))
        complaint = cursor.fetchone()
        if not complaint:
            return error_response("Complaint not found", 404)

        # Worker check in users table
        cursor.execute(
            "SELECT * FROM users WHERE user_id = %s AND role = 'worker' AND is_active = 1",
            (worker_id,)
        )
        worker = cursor.fetchone()
        if not worker:
            return error_response("Worker not found or inactive", 404)

        # Deactivate old current assignments
        cursor.execute(
            "UPDATE assignments SET is_current = 0 WHERE complaint_id = %s",
            (complaint_id,)
        )
        cursor.execute(
            """INSERT INTO assignments
               (complaint_id, worker_id, assigned_by, notes)
               VALUES (%s, %s, %s, %s)""",
            (complaint_id, worker_id, identity["user_id"], notes or None)
        )
        # Update complaint
        cursor.execute(
            """UPDATE complaints
               SET status = 'Assigned', worker_id = %s, updated_at = NOW()
               WHERE complaint_id = %s""",
            (worker_id, complaint_id)
        )
        cursor.execute(
            """INSERT INTO complaint_status_history
               (complaint_id, old_status, new_status, changed_by, notes)
               VALUES (%s, %s, 'Assigned', %s, %s)""",
            (complaint_id, complaint["status"], identity["user_id"],
             f"Assigned to worker: {worker['name']}")
        )
    db.commit()

    notify_complaint_assigned(complaint["user_id"], complaint_id, worker["name"])
    return success_response(message=f"Complaint assigned to {worker['name']}")


# ─────────────────────────────────────────────
# RESIDENT VERIFICATION ADMIN MANAGEMENT
# ─────────────────────────────────────────────

# GET /api/admin/resident-verification/requests
@admin_bp.route("/resident-verification/requests", methods=["GET"])
@jwt_required()
@admin_required
def get_verification_requests():
    status   = request.args.get("status", "").strip()
    ward_id  = request.args.get("ward_id")
    search   = request.args.get("search", "").strip()
    page     = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 15))

    query = """
        SELECT r.*,
               u.name as user_name, u.mobile as user_mobile, u.email as user_email,
               u.residency_status as current_user_status,
               w.name as ward_name,
               adm.name as reviewer_name
        FROM resident_verification_requests r
        JOIN users u ON r.user_id = u.user_id
        LEFT JOIN wards w ON r.ward_id = w.ward_id
        LEFT JOIN users adm ON r.reviewed_by = adm.user_id
        WHERE 1=1
    """
    params = []

    if status and status != "all":
        query += " AND r.status = %s"
        params.append(status)
    if ward_id:
        query += " AND r.ward_id = %s"
        params.append(int(ward_id))
    if search:
        query += " AND (u.name LIKE %s OR u.mobile LIKE %s OR r.address LIKE %s)"
        like = f"%{search}%"
        params += [like, like, like]

    query += " ORDER BY r.created_at DESC"

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(f"SELECT COUNT(*) as total FROM ({query}) sub", params)
        total = cursor.fetchone()["total"]

        offset = (page - 1) * per_page
        cursor.execute(f"{query} LIMIT %s OFFSET %s", params + [per_page, offset])
        requests_list = cursor.fetchall()

    return success_response(data={
        "requests": requests_list,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page if per_page else 1
        }
    })


# PUT /api/admin/resident-verification/<request_id>/approve
@admin_bp.route("/resident-verification/<int:request_id>/approve", methods=["PUT"])
@jwt_required()
@admin_required
def approve_verification_request(request_id):
    identity = get_jwt_identity()
    admin_id = identity["user_id"]
    data     = request.get_json(silent=True) or {}
    remarks  = data.get("remarks", "Approved by Panchayat Officer").strip()

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            "SELECT * FROM resident_verification_requests WHERE request_id = %s",
            (request_id,)
        )
        req = cursor.fetchone()
        if not req:
            return error_response("Verification request not found", 404)

        user_id = req["user_id"]
        ward_id = req["ward_id"]
        address = req["address"]

        # Update verification request
        cursor.execute(
            """UPDATE resident_verification_requests
               SET status = 'approved',
                   review_remarks = %s,
                   reviewed_by = %s,
                   reviewed_at = NOW()
               WHERE request_id = %s""",
            (remarks, admin_id, request_id)
        )

        # Update citizen profile
        cursor.execute(
            """UPDATE users
               SET residency_status = 'verified',
                   residency_ward_id = %s,
                   residency_address = %s,
                   verified_at = NOW(),
                   verified_by = %s,
                   verification_remarks = %s
               WHERE user_id = %s""",
            (ward_id, address, admin_id, remarks, user_id)
        )

        # Update existing active complaints by this resident to reflect verified status
        cursor.execute(
            """UPDATE complaints
               SET is_verified_resident = 1
               WHERE user_id = %s AND status NOT IN ('Resolved', 'Rejected')""",
            (user_id,)
        )
    db.commit()

    return success_response(message="Resident verification request approved successfully. Citizen marked as Verified Resident.")


# PUT /api/admin/resident-verification/<request_id>/reject
@admin_bp.route("/resident-verification/<request_id>/reject", methods=["PUT"])
@jwt_required()
@admin_required
def reject_verification_request(request_id):
    identity = get_jwt_identity()
    admin_id = identity["user_id"]
    data     = request.get_json(silent=True) or {}
    remarks  = data.get("remarks", "").strip()

    if not remarks:
        return error_response("Rejection reason/remarks are required so the citizen knows why verification could not be confirmed", 422)

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            "SELECT * FROM resident_verification_requests WHERE request_id = %s",
            (request_id,)
        )
        req = cursor.fetchone()
        if not req:
            return error_response("Verification request not found", 404)

        user_id = req["user_id"]

        # Update verification request
        cursor.execute(
            """UPDATE resident_verification_requests
               SET status = 'rejected',
                   review_remarks = %s,
                   reviewed_by = %s,
                   reviewed_at = NOW()
               WHERE request_id = %s""",
            (remarks, admin_id, request_id)
        )

        # Update citizen status to rejected
        cursor.execute(
            """UPDATE users
               SET residency_status = 'rejected',
                   verification_remarks = %s
               WHERE user_id = %s AND residency_status != 'verified'""",
            (remarks, user_id)
        )
    db.commit()

    return success_response(message="Resident verification request rejected.")


# GET /api/admin/resident-verification/codes
@admin_bp.route("/resident-verification/codes", methods=["GET"])
@jwt_required()
@admin_required
def get_verification_codes():
    ward_id = request.args.get("ward_id")
    status  = request.args.get("status", "")  # 'used' or 'available'

    query = """
        SELECT c.*,
               w.name as ward_name,
               u.name as used_by_name, u.mobile as used_by_mobile,
               adm.name as created_by_name
        FROM village_verification_codes c
        JOIN wards w ON c.ward_id = w.ward_id
        JOIN users adm ON c.created_by = adm.user_id
        LEFT JOIN users u ON c.used_by = u.user_id
        WHERE 1=1
    """
    params = []

    if ward_id:
        query += " AND c.ward_id = %s"
        params.append(int(ward_id))
    if status == "used":
        query += " AND c.is_used = 1"
    elif status == "available":
        query += " AND c.is_used = 0 AND (c.expires_at IS NULL OR c.expires_at > NOW())"

    query += " ORDER BY c.created_at DESC LIMIT 100"

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(query, params)
        codes = cursor.fetchall()

    return success_response(data={"codes": codes, "total": len(codes)})


# POST /api/admin/resident-verification/codes
@admin_bp.route("/resident-verification/codes", methods=["POST"])
@jwt_required()
@admin_required
def generate_verification_codes():
    identity = get_jwt_identity()
    admin_id = identity["user_id"]
    data     = request.get_json(silent=True) or {}
    ward_id  = data.get("ward_id")
    count    = int(data.get("count", 1))
    custom_code = (data.get("custom_code") or "").strip().upper()

    if not ward_id:
        return error_response("Ward ID is required (1 to 5)", 422)

    try:
        ward_id = int(ward_id)
        if ward_id < 1 or ward_id > 5:
            return error_response("Ward ID must be between 1 and 5", 422)
    except ValueError:
        return error_response("Invalid Ward ID", 422)

    count = min(max(1, count), 25)

    created_codes = []
    db = get_db()
    with db.cursor() as cursor:
        if custom_code:
            # Check unique
            cursor.execute("SELECT code_id FROM village_verification_codes WHERE code = %s", (custom_code,))
            if cursor.fetchone():
                return error_response(f"Code '{custom_code}' already exists", 409)
            cursor.execute(
                """INSERT INTO village_verification_codes (code, ward_id, created_by)
                   VALUES (%s, %s, %s)""",
                (custom_code, ward_id, admin_id)
            )
            created_codes.append(custom_code)
        else:
            for _ in range(count):
                # Format: VEM-W{ward}-{4 alphanumeric random chars}
                rand_suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
                code = f"VEM-W{ward_id}-{rand_suffix}"
                try:
                    cursor.execute(
                        """INSERT INTO village_verification_codes (code, ward_id, created_by)
                           VALUES (%s, %s, %s)""",
                        (code, ward_id, admin_id)
                    )
                    created_codes.append(code)
                except Exception:
                    pass
    db.commit()

    return success_response(
        data={"codes": created_codes, "count": len(created_codes), "ward_id": ward_id},
        message=f"Generated {len(created_codes)} verification code(s) for Ward {ward_id}"
    )


# GET /api/admin/resident-verification/stats
@admin_bp.route("/resident-verification/stats", methods=["GET"])
@jwt_required()
@admin_required
def get_verification_stats():
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) as total FROM resident_verification_requests")
        total_reqs = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) as pending FROM resident_verification_requests WHERE status = 'pending'")
        pending_reqs = cursor.fetchone()["pending"]

        cursor.execute("SELECT COUNT(*) as approved FROM resident_verification_requests WHERE status = 'approved'")
        approved_reqs = cursor.fetchone()["approved"]

        cursor.execute("SELECT COUNT(*) as rejected FROM resident_verification_requests WHERE status = 'rejected'")
        rejected_reqs = cursor.fetchone()["rejected"]

        cursor.execute("SELECT COUNT(*) as verified_citizens FROM users WHERE residency_status = 'verified'")
        verified_citizens = cursor.fetchone()["verified_citizens"]

        cursor.execute("SELECT COUNT(*) as available_codes FROM village_verification_codes WHERE is_used = 0")
        available_codes = cursor.fetchone()["available_codes"]

        cursor.execute("SELECT COUNT(*) as duplicate_suspects FROM complaints WHERE is_duplicate_suspect = 1")
        duplicate_suspects = cursor.fetchone()["duplicate_suspects"]

    return success_response(data={
        "total_requests": total_reqs,
        "pending_requests": pending_reqs,
        "approved_requests": approved_reqs,
        "rejected_requests": rejected_reqs,
        "verified_citizens": verified_citizens,
        "available_codes": available_codes,
        "duplicate_suspects": duplicate_suspects,
    })


# ─────────────────────────────────────────────
# GET /api/admin/analytics
# Dashboard analytics
# ─────────────────────────────────────────────
@admin_bp.route("/analytics", methods=["GET"])
@jwt_required()
@admin_required
def get_analytics():
    db = get_db()
    with db.cursor() as cursor:
        # Status counts
        cursor.execute("SELECT status, COUNT(*) as count FROM complaints GROUP BY status")
        status_counts = {r["status"]: r["count"] for r in cursor.fetchall()}

        # Category counts
        cursor.execute(
            "SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY count DESC"
        )
        category_counts = cursor.fetchall()

        # Monthly trend (last 6 months)
        cursor.execute(
            """SELECT DATE_FORMAT(created_at, '%%b %%Y') as month,
                      COUNT(*) as count
               FROM complaints
               WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
               GROUP BY DATE_FORMAT(created_at, '%%Y-%%m'), month
               ORDER BY DATE_FORMAT(created_at, '%%Y-%%m') ASC"""
        )
        monthly_trend = cursor.fetchall()

        # Worker performance using unified users + assignments
        cursor.execute(
            """SELECT w.user_id as worker_id,
                      w.name as worker_name,
                      COUNT(a.assignment_id) as total_assigned,
                      SUM(CASE WHEN c.status = 'Resolved' THEN 1 ELSE 0 END) as resolved
               FROM users w
               LEFT JOIN assignments a ON w.user_id = a.worker_id
               LEFT JOIN complaints c ON a.complaint_id = c.complaint_id
               WHERE w.role = 'worker' AND w.is_active = 1
               GROUP BY w.user_id, w.name
               ORDER BY total_assigned DESC"""
        )
        worker_performance = cursor.fetchall()

        # Total complaints
        cursor.execute("SELECT COUNT(*) as total FROM complaints")
        total = cursor.fetchone()["total"]

        # Average rating
        cursor.execute("SELECT AVG(rating) as avg_rating FROM feedback")
        avg_rating = cursor.fetchone()["avg_rating"] or 0

        # Average resolution days
        cursor.execute(
            """SELECT AVG(DATEDIFF(resolved_at, created_at)) as avg_days
               FROM complaints
               WHERE status = 'Resolved' AND resolved_at IS NOT NULL"""
        )
        avg_resolution = cursor.fetchone()["avg_days"] or 0

    return success_response(data={
        "summary": {
            "total": total,
            "submitted":    status_counts.get("Submitted", 0),
            "under_review": status_counts.get("Under Review", 0),
            "assigned":     status_counts.get("Assigned", 0),
            "in_progress":  status_counts.get("In Progress", 0),
            "resolved":     status_counts.get("Resolved", 0),
            "rejected":     status_counts.get("Rejected", 0),
            "avg_rating":   round(float(avg_rating), 2),
            "avg_resolution_days": round(float(avg_resolution), 1),
        },
        "category_breakdown": category_counts,
        "monthly_trend": monthly_trend,
        "worker_performance": worker_performance,
    })


# ─────────────────────────────────────────────
# GET /api/admin/survey-insights
# Vemavaram field survey data
# ─────────────────────────────────────────────
@admin_bp.route("/survey-insights", methods=["GET"])
@jwt_required()
@admin_required
def survey_insights():
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM survey_insights ORDER BY response_count DESC")
        insights = cursor.fetchall()
        cursor.execute("SELECT SUM(response_count) as total FROM survey_insights")
        total_responses = cursor.fetchone()["total"] or 0

    return success_response(data={
        "village": "Vemavaram",
        "total_responses": total_responses,
        "survey_year": 2025,
        "insights": insights,
    })


# ─────────────────────────────────────────────
# GET /api/admin/reports
# Filtered report query
# ─────────────────────────────────────────────
@admin_bp.route("/reports", methods=["GET"])
@jwt_required()
@admin_required
def generate_report():
    from_date = request.args.get("from_date", "")
    to_date   = request.args.get("to_date", "")
    category  = request.args.get("category", "")

    query = """
        SELECT c.complaint_id, c.title, c.category, c.status, c.priority,
               c.location, c.is_verified_resident, c.is_duplicate_suspect, c.created_at, c.resolved_at,
               u.name as complainant_name, u.mobile as complainant_mobile,
               w.name as worker_name, wp.department,
               f.rating, f.remarks
        FROM complaints c
        JOIN users u ON c.user_id = u.user_id
        LEFT JOIN assignments a ON c.complaint_id = a.complaint_id AND a.is_current = 1
        LEFT JOIN users w ON a.worker_id = w.user_id
        LEFT JOIN worker_profiles wp ON w.user_id = wp.user_id
        LEFT JOIN feedback f ON c.complaint_id = f.complaint_id
        WHERE 1=1
    """
    params = []
    if from_date:
        query += " AND DATE(c.created_at) >= %s"
        params.append(from_date)
    if to_date:
        query += " AND DATE(c.created_at) <= %s"
        params.append(to_date)
    if category:
        query += " AND c.category = %s"
        params.append(category)

    query += " ORDER BY c.created_at DESC"

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(query, params)
        rows = cursor.fetchall()

    return success_response(data={"report": rows, "total": len(rows)})

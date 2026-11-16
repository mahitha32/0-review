"""
app/routes/complaints.py
Complaint CRUD routes for citizens & workers
Village Complaint Redressal System - Vemavaram Village
"""

import re
import difflib
from datetime import datetime, timedelta
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import get_db
from app.services.image_service import upload_image
from app.services.ai_classifier import classify_complaint
from app.services.notification_service import notify_complaint_received
from app.services.email_service import send_complaint_notification_email
from app.utils.helpers import success_response, error_response, format_complaint_id

complaints_bp = Blueprint("complaints", __name__)

VALID_CATEGORIES = [
    "Road Issues",
    "Streetlight Issues",
    "Water Supply Problems",
    "Drainage Problems",
    "Garbage Collection Issues",
    "Sanitation Issues",
]

STATUS_FLOW = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Rejected"]


def _generate_complaint_id(cursor) -> str:
    year = datetime.now().year
    cursor.execute(
        "SELECT COUNT(*) as cnt FROM complaints WHERE complaint_id LIKE %s",
        (f"CMP{year}%",)
    )
    seq = cursor.fetchone()["cnt"] + 1
    return format_complaint_id(year, seq)


def _check_duplicate(new_comp, recent_complaints):
    """
    Checks for potential duplicate complaints in the same category within the past 14 days.
    Does NOT reject outright; flags suspect duplicates for administrative cross-check.
    """
    def clean_text(t):
        return re.sub(r'[^a-zA-Z0-9\s]', '', (t or '').lower()).strip()

    def get_tokens(t):
        stop_words = {"the", "is", "at", "in", "on", "a", "an", "and", "or", "to", "of", "for", "with", "near", "by"}
        return set(w for w in clean_text(t).split() if len(w) > 2 and w not in stop_words)

    new_title = clean_text(new_comp.get("title", ""))
    new_desc = clean_text(new_comp.get("description", ""))
    new_loc = clean_text(new_comp.get("location", ""))
    new_ward = str(new_comp.get("ward_id") or "")
    new_tokens = get_tokens(new_title + " " + new_desc)

    for ex in recent_complaints:
        ex_title = clean_text(ex.get("title", ""))
        ex_desc = clean_text(ex.get("description", ""))
        ex_loc = clean_text(ex.get("location", ""))
        ex_ward = str(ex.get("ward_id") or "")

        # 1. Location match
        same_ward = (new_ward and ex_ward and new_ward == ex_ward)
        same_loc = (new_loc and ex_loc and (new_loc in ex_loc or ex_loc in new_loc or difflib.SequenceMatcher(None, new_loc, ex_loc).ratio() > 0.70))

        # 2. Text similarity
        title_sim = difflib.SequenceMatcher(None, new_title, ex_title).ratio()
        desc_sim = difflib.SequenceMatcher(None, new_desc, ex_desc).ratio()

        ex_tokens = get_tokens(ex_title + " " + ex_desc)
        jaccard = len(new_tokens & ex_tokens) / max(1, len(new_tokens | ex_tokens))

        is_dup = False
        if same_loc and (desc_sim > 0.45 or jaccard > 0.35 or title_sim > 0.60):
            is_dup = True
        elif same_ward and (desc_sim > 0.60 or jaccard > 0.50):
            is_dup = True
        elif desc_sim > 0.75 or (title_sim > 0.80 and jaccard > 0.40):
            is_dup = True

        if is_dup:
            date_str = ex["created_at"].strftime("%d %b") if hasattr(ex["created_at"], "strftime") else "recently"
            return {
                "is_duplicate_suspect": 1,
                "duplicate_of_id": ex["complaint_id"],
                "duplicate_reason": f"Similar issue reported on {date_str} at {ex.get('location', '')} ({ex['complaint_id']})"
            }

    return {"is_duplicate_suspect": 0, "duplicate_of_id": None, "duplicate_reason": None}


# ─────────────────────────────────────────────
# POST /api/complaints
# Create a new complaint (with quality validation, rate-limiting & duplicate detection)
# ─────────────────────────────────────────────
@complaints_bp.route("", methods=["POST"])
@jwt_required()
def create_complaint():
    identity = get_jwt_identity()
    user_id = identity["user_id"]

    # Support both JSON and multipart/form-data
    if request.content_type and "multipart/form-data" in request.content_type:
        title       = request.form.get("title", "").strip()
        category    = request.form.get("category", "").strip()
        description = request.form.get("description", "").strip()
        location    = request.form.get("location", "").strip()
        latitude    = request.form.get("latitude")
        longitude   = request.form.get("longitude")
        ward_id     = request.form.get("ward_id")
        image_file  = request.files.get("image")
    else:
        data        = request.get_json(silent=True) or {}
        title       = data.get("title", "").strip()
        category    = data.get("category", "").strip()
        description = data.get("description", "").strip()
        location    = data.get("location", "").strip()
        latitude    = data.get("latitude")
        longitude   = data.get("longitude")
        ward_id     = data.get("ward_id")
        image_file  = None

    errors = []
    # Quality validation
    if not title or len(title) < 5:
        errors.append("Title is required and must be at least 5 characters")

    if not description or len(description) < 20:
        errors.append("Description must be at least 20 characters to provide sufficient detail for village workers")
    else:
        # Check against repetitive gibberish
        desc_clean = re.sub(r"\s+", "", description.lower())
        if len(set(desc_clean)) < 4:
            errors.append("Please provide a meaningful complaint description (repetitive characters detected)")

    if not location or len(location) < 3:
        errors.append("Location/Landmark in Vemavaram is required")

    if category and category not in VALID_CATEGORIES:
        errors.append(f"Invalid category. Must be one of: {', '.join(VALID_CATEGORIES)}")

    if errors:
        return error_response("Validation failed", 422, errors)

    db = get_db()
    with db.cursor() as cursor:
        # 1. Rate limiting: Check complaints submitted by this user in the past 1 hour
        cursor.execute(
            """SELECT COUNT(*) as recent_count FROM complaints
               WHERE user_id = %s AND created_at >= NOW() - INTERVAL 1 HOUR""",
            (user_id,)
        )
        recent_count = cursor.fetchone()["recent_count"]
        if recent_count >= 5:
            return error_response(
                "Hourly rate limit exceeded. You can submit a maximum of 5 complaints per hour to maintain system quality.",
                429
            )

        # 2. Check user's village residency status
        cursor.execute(
            """SELECT residency_status, residency_ward_id, name FROM users WHERE user_id = %s""",
            (user_id,)
        )
        user_info = cursor.fetchone() or {}
        is_verified_resident = 1 if user_info.get("residency_status") == "verified" else 0
        citizen_name = user_info.get("name") or "Citizen"

        # Default ward_id to user's registered residency ward if not specified
        if not ward_id and user_info.get("residency_ward_id"):
            ward_id = user_info["residency_ward_id"]

    # AI category and priority classification
    ai_result = classify_complaint(title, description)
    ai_suggestion = ai_result["category"]
    smart_priority = ai_result["priority"]

    if not category:
        category = ai_suggestion or VALID_CATEGORIES[0]

    # 3. Duplicate Detection across past 14 days in the same category
    with db.cursor() as cursor:
        cursor.execute(
            """SELECT complaint_id, title, description, location, ward_id, created_at
               FROM complaints
               WHERE category = %s
                 AND status NOT IN ('Rejected')
                 AND created_at >= NOW() - INTERVAL 14 DAY
               ORDER BY created_at DESC LIMIT 30""",
            (category,)
        )
        recent_in_cat = cursor.fetchall()

    dup_check = _check_duplicate(
        {"title": title, "description": description, "location": location, "ward_id": ward_id},
        recent_in_cat
    )
    is_duplicate_suspect = dup_check["is_duplicate_suspect"]
    duplicate_of_id      = dup_check["duplicate_of_id"]
    duplicate_reason     = dup_check["duplicate_reason"]

    # Upload image to Cloudinary if provided
    image_url = None
    if image_file and image_file.filename:
        try:
            image_bytes = image_file.read()
            image_url = upload_image(image_bytes, image_file.filename, folder="complaints")
        except Exception as e:
            return error_response(f"Image upload failed: {str(e)}", 500)

    # Insert complaint into database
    with db.cursor() as cursor:
        complaint_id = _generate_complaint_id(cursor)
        cursor.execute(
            """INSERT INTO complaints
               (complaint_id, user_id, title, category, description,
                image_url, ai_category_suggestion, location, latitude, longitude,
                ward_id, status, priority, is_verified_resident, is_duplicate_suspect,
                duplicate_of_id, duplicate_reason)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Submitted', %s, %s, %s, %s, %s)""",
            (complaint_id, user_id, title, category, description,
             image_url, ai_suggestion, location, latitude or None, longitude or None,
             ward_id or None, smart_priority, is_verified_resident, is_duplicate_suspect,
             duplicate_of_id, duplicate_reason)
        )
        # Record status history audit trail
        history_note = "Complaint submitted by " + ("verified village resident" if is_verified_resident else "citizen (unverified residency)")
        cursor.execute(
            """INSERT INTO complaint_status_history
               (complaint_id, old_status, new_status, changed_by, notes)
               VALUES (%s, NULL, 'Submitted', %s, %s)""",
            (complaint_id, user_id, history_note)
        )
    db.commit()

    # Trigger in-app & push notification to citizen
    notify_complaint_received(user_id, complaint_id)

    # Send outgoing email notification to official admin email (gadalamahithavasavi@gmail.com)
    try:
        submission_date_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
        send_complaint_notification_email(
            complaint_id=complaint_id,
            title=title,
            category=category,
            description=description,
            submission_date=submission_date_str,
            citizen_name=citizen_name,
            status="Submitted",
            image_url=image_url,
        )
    except Exception as email_err:
        from flask import current_app
        current_app.logger.error(f"Outgoing complaint email alert error (non-fatal): {email_err}")

    response_message = "Complaint submitted successfully"
    if is_duplicate_suspect:
        response_message += f". Notice: A similar issue was recently reported ({duplicate_of_id}). The Panchayat team will review to prevent duplicate work."

    return success_response(
        data={
            "complaint_id": complaint_id,
            "category": category,
            "ai_suggestion": ai_suggestion,
            "smart_priority": smart_priority,
            "image_url": image_url,
            "is_verified_resident": bool(is_verified_resident),
            "is_duplicate_suspect": bool(is_duplicate_suspect),
            "duplicate_of_id": duplicate_of_id,
            "duplicate_reason": duplicate_reason,
        },
        message=response_message,
        status_code=201
    )


# ─────────────────────────────────────────────
# GET /api/complaints
# List logged-in user's complaints (paginated)
# ─────────────────────────────────────────────
@complaints_bp.route("", methods=["GET"])
@jwt_required()
def list_complaints():
    identity = get_jwt_identity()
    user_id  = identity["user_id"]
    page     = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    status   = request.args.get("status", "")
    category = request.args.get("category", "")

    query = "SELECT * FROM complaints WHERE user_id = %s"
    params = [user_id]

    if status:
        query += " AND status = %s"
        params.append(status)
    if category:
        query += " AND category = %s"
        params.append(category)

    query += " ORDER BY created_at DESC"

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
# GET /api/complaints/<id>
# Get complaint details
# ─────────────────────────────────────────────
@complaints_bp.route("/<complaint_id>", methods=["GET"])
@jwt_required()
def get_complaint(complaint_id):
    identity = get_jwt_identity()
    user_id  = identity["user_id"]
    role     = identity["role"]

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM complaints WHERE complaint_id = %s", (complaint_id,))
        complaint = cursor.fetchone()

    if not complaint:
        return error_response("Complaint not found", 404)

    # Citizens can only view their own complaints; workers and admins can view any
    if role in ("citizen", "villager") and complaint["user_id"] != user_id:
        return error_response("Access denied", 403)

    with db.cursor() as cursor:
        # Status history
        cursor.execute(
            """SELECT csh.*, u.name as changed_by_name
               FROM complaint_status_history csh
               JOIN users u ON csh.changed_by = u.user_id
               WHERE csh.complaint_id = %s
               ORDER BY csh.changed_at ASC""",
            (complaint_id,)
        )
        history = cursor.fetchall()

        # Assignment info joining unified users + worker_profiles
        cursor.execute(
            """SELECT a.*, u.name as worker_name, u.mobile as worker_mobile,
                      wp.department
               FROM assignments a
               JOIN users u ON a.worker_id = u.user_id
               LEFT JOIN worker_profiles wp ON u.user_id = wp.user_id
               WHERE a.complaint_id = %s AND a.is_current = 1""",
            (complaint_id,)
        )
        assignment = cursor.fetchone()

        # Feedback
        cursor.execute(
            "SELECT * FROM feedback WHERE complaint_id = %s", (complaint_id,)
        )
        feedback = cursor.fetchone()

    complaint["status_history"] = history
    complaint["assignment"] = assignment
    complaint["feedback"] = feedback

    return success_response(data=complaint)


# ─────────────────────────────────────────────
# GET /api/complaints/track/<complaint_id>
# Public complaint status tracker by ID (no auth required)
# ─────────────────────────────────────────────
@complaints_bp.route("/track/<complaint_id>", methods=["GET"])
def track_complaint_public(complaint_id):
    complaint_id = complaint_id.strip()
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """SELECT complaint_id, title, category, description, location,
                      ward_id, status, priority, image_url, resolution_image_url, resolution_notes,
                      is_verified_resident, is_duplicate_suspect, duplicate_of_id,
                      created_at, resolved_at
               FROM complaints WHERE complaint_id = %s""",
            (complaint_id,)
        )
        complaint = cursor.fetchone()

    if not complaint:
        return error_response(f"Complaint ID '{complaint_id}' not found. Please verify the ID and try again.", 404)

    with db.cursor() as cursor:
        # Status history timeline
        cursor.execute(
            """SELECT csh.old_status, csh.new_status, csh.notes, csh.changed_at
               FROM complaint_status_history csh
               WHERE csh.complaint_id = %s
               ORDER BY csh.changed_at ASC""",
            (complaint_id,)
        )
        history = cursor.fetchall()

        # Assignment info
        cursor.execute(
            """SELECT a.assignment_id, a.notes as assignment_notes, a.assigned_at,
                      wp.department
               FROM assignments a
               JOIN users u ON a.worker_id = u.user_id
               LEFT JOIN worker_profiles wp ON u.user_id = wp.user_id
               WHERE a.complaint_id = %s AND a.is_current = 1""",
            (complaint_id,)
        )
        assignment = cursor.fetchone()

        # Public feedback summary
        cursor.execute(
            "SELECT rating, remarks, created_at FROM feedback WHERE complaint_id = %s",
            (complaint_id,)
        )
        feedback = cursor.fetchone()

    complaint["status_history"] = history
    complaint["assignment"] = assignment
    complaint["feedback"] = feedback

    return success_response(data=complaint)


# ─────────────────────────────────────────────
# GET /api/complaints/gallery
# Public project gallery: verified complaints and resolution evidence photos
# ─────────────────────────────────────────────
@complaints_bp.route("/gallery", methods=["GET"])
def get_gallery():
    limit = int(request.args.get("limit", 12))
    limit = min(max(1, limit), 50)
    category = request.args.get("category", "").strip()

    query = """
        SELECT complaint_id, title, category, description, location,
               status, priority, image_url, resolution_image_url, resolution_notes,
               is_verified_resident, created_at, resolved_at
        FROM complaints
        WHERE (image_url IS NOT NULL AND image_url != '')
           OR (resolution_image_url IS NOT NULL AND resolution_image_url != '')
    """
    params = []
    if category:
        query += " AND category = %s"
        params.append(category)

    query += " ORDER BY COALESCE(resolved_at, created_at) DESC LIMIT %s"
    params.append(limit)

    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(query, tuple(params))
        items = cursor.fetchall()

    return success_response(data={"items": items, "count": len(items)})


# ─────────────────────────────────────────────
# GET /api/complaints/categories
# List all valid complaint categories
# ─────────────────────────────────────────────
@complaints_bp.route("/categories", methods=["GET"])
def get_categories():
    return success_response(data={"categories": VALID_CATEGORIES})


# ─────────────────────────────────────────────
# POST /api/complaints/classify
# AI helper: Suggest category and priority
# ─────────────────────────────────────────────
@complaints_bp.route("/classify", methods=["POST"])
@jwt_required()
def classify():
    data = request.get_json(silent=True) or {}
    suggestion = classify_complaint(
        data.get("title", ""), data.get("description", "")
    )
    return success_response(data=suggestion)

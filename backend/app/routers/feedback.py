import time
import os
from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List, Dict, Any

from backend.app.schemas.stadium import FeedbackSchema

router = APIRouter()

# Prototype feedbacks database
feedbacks_db: List[Dict[str, Any]] = []

def verify_admin_token(x_admin_token: Optional[str] = Header(None)):
    expected_token = os.getenv("ADMIN_SECRET_KEY", "stadiumflow-admin-secret-token")
    if not x_admin_token or x_admin_token != expected_token:
        raise HTTPException(
            status_code=401, 
            detail="Unauthorized operator token. X-Admin-Token header missing or incorrect."
        )

@router.post("/api/feedback")
def submit_feedback(request: FeedbackSchema):
    feedbacks_db.append({
        "location_id": request.location_id,
        "helpful": request.helpful,
        "comment": request.comment,
        "timestamp": time.time()
    })
    return {"status": "success", "message": "Feedback submitted successfully."}

@router.get("/api/feedback")
def get_all_feedbacks(x_admin_token: Optional[str] = Header(None)):
    verify_admin_token(x_admin_token)
    return feedbacks_db

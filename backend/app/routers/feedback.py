import time
from fastapi import APIRouter, Depends
from typing import List, Dict, Any

from backend.app.schemas.stadium import FeedbackSchema
from backend.app.core.security import verify_admin_token

router = APIRouter()

# Prototype in-memory feedbacks database
feedbacks_db: List[Dict[str, Any]] = []

@router.post("/api/feedback")
def submit_feedback(request: FeedbackSchema):
    """
    Submit spectator feedback for a specific facility or routing recommendation.
    Publicly accessible endpoint.
    """
    feedbacks_db.append({
        "location_id": request.location_id,
        "helpful": request.helpful,
        "comment": request.comment,
        "timestamp": time.time()
    })
    return {"status": "success", "message": "Feedback submitted successfully."}

@router.get("/api/feedback")
def get_all_feedbacks(admin_token: str = Depends(verify_admin_token)):
    """
    Retrieve all collected spectator feedbacks.
    Requires a valid operator admin token.
    """
    return feedbacks_db

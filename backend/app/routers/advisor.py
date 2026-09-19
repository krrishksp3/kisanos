from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.schemas.advisor import AdvisorRequest, AdvisorResponse
from app.services.advisor_service import advisor_service

router = APIRouter(prefix="/advisor", tags=["AI Advisor"])


@router.post("/chat", response_model=AdvisorResponse)
def ask_advisor(
    request: AdvisorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Core AI Farming Advisor endpoint.
    Retrieves farm context, live weather, and ICAR agronomy RAG chunks to synthesize structured advice.
    """
    return advisor_service.generate_advice(db, current_user, request)

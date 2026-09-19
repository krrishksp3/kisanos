from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Market
from app.schemas.market import MarketOut

router = APIRouter(prefix="/markets", tags=["Markets"])


@router.get("", response_model=List[MarketOut])
def list_markets(
    crop: Optional[str] = Query(default=None, description="Filter by crop name (e.g. Wheat, Soybean)"),
    location: Optional[str] = Query(default=None, description="Filter by location or district"),
    db: Session = Depends(get_db)
):
    """
    List Mandi rates, APMC yard benchmarks, and verified buyer requirements.
    All records explicitly disclose their data_source and live verification status.
    """
    query = db.query(Market)
    if crop:
        query = query.filter(Market.crop.ilike(f"%{crop}%"))
    if location:
        query = query.filter(Market.location.ilike(f"%{location}%"))
    return query.order_by(Market.price_per_quintal.desc()).all()


@router.get("/{id}", response_model=MarketOut)
def get_market(id: str, db: Session = Depends(get_db)):
    """Retrieve specific Mandi or buyer record."""
    market = db.query(Market).filter(Market.id == id).first()
    if not market:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="मंडी रिकॉर्ड नहीं मिला।")
    return market

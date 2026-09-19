from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, Farm, HarvestLot
from app.schemas.harvest import HarvestLotCreate, HarvestLotUpdate, HarvestLotOut

router = APIRouter(prefix="/harvest", tags=["Harvest"])


@router.get("", response_model=List[HarvestLotOut])
def list_harvest_lots(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List harvest lots created from any of the farmer's farms."""
    user_farm_ids = [f.id for f in current_user.farms]
    return db.query(HarvestLot).filter(HarvestLot.farm_id.in_(user_farm_ids)).order_by(HarvestLot.created_at.desc()).all()


@router.post("", response_model=HarvestLotOut, status_code=status.HTTP_201_CREATED)
def create_harvest_lot(lot_in: HarvestLotCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a digital harvest lot ready for Mandi and buyer discovery."""
    farm = db.query(Farm).filter(Farm.id == lot_in.farm_id).first()
    if not farm or farm.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="खेत का विवरण नहीं मिला।")

    lot = HarvestLot(
        farm_id=lot_in.farm_id,
        crop=lot_in.crop,
        quantity=lot_in.quantity,
        quality=lot_in.quality,
        location=lot_in.location,
        status=lot_in.status,
        moisture_percentage=lot_in.moisture_percentage,
        expected_price_per_quintal=lot_in.expected_price_per_quintal,
        data_source="farmer_logged"
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return lot


@router.get("/{id}", response_model=HarvestLotOut)
def get_harvest_lot(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve details of a specific harvest lot."""
    user_farm_ids = [f.id for f in current_user.farms]
    lot = db.query(HarvestLot).filter(
        HarvestLot.id == id,
        HarvestLot.farm_id.in_(user_farm_ids)
    ).first()
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="हार्वेस्ट लॉट नहीं मिला।")
    return lot


@router.patch("/{id}", response_model=HarvestLotOut)
def update_harvest_lot(
    id: str,
    lot_update: HarvestLotUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update harvest lot status (e.g. ready_for_sale, bidding, sold) or quantity."""
    user_farm_ids = [f.id for f in current_user.farms]
    lot = db.query(HarvestLot).filter(
        HarvestLot.id == id,
        HarvestLot.farm_id.in_(user_farm_ids)
    ).first()
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="हार्वेस्ट लॉट नहीं मिला।")

    update_data = lot_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lot, field, value)

    db.commit()
    db.refresh(lot)
    return lot

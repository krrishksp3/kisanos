from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, Farm, CropHistory
from app.schemas.farm import (
    FarmCreate, FarmUpdate, FarmOut, CropHistoryCreate, CropHistoryOut, FarmInsightsResponse
)
from app.services.farm_memory_service import farm_memory_service

router = APIRouter(prefix="/farms", tags=["Farms"])



def get_user_farm(farm_id: str, current_user: User, db: Session) -> Farm:
    """Helper to ensure farm exists and belongs to the authenticated farmer."""
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="खेत का विवरण नहीं मिला (Farm not found).")
    if farm.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="अनधिकृत पहुंच (Not authorized to access this farm).")
    return farm


@router.get("", response_model=List[FarmOut])
def list_my_farms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all farms owned by the authenticated farmer."""
    return db.query(Farm).filter(Farm.user_id == current_user.id).all()


@router.post("", response_model=FarmOut, status_code=status.HTTP_201_CREATED)
def create_farm(farm_in: FarmCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Add a new farm profile for the current farmer."""
    farm = Farm(
        user_id=current_user.id,
        name=farm_in.name,
        location=farm_in.location,
        latitude=farm_in.latitude,
        longitude=farm_in.longitude,
        area_acres=farm_in.area_acres,
        soil_type=farm_in.soil_type,
        soil_ph=farm_in.soil_ph,
        irrigation_type=farm_in.irrigation_type,
        current_crop=farm_in.current_crop,
        current_stage=farm_in.current_stage
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm


@router.get("/{farm_id}", response_model=FarmOut)
def get_farm(farm_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get single farm details with attached histories."""
    return get_user_farm(farm_id, current_user, db)


@router.put("/{farm_id}", response_model=FarmOut)
def update_farm(farm_id: str, farm_in: FarmUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update farm telemetry, soil or crop details."""
    farm = get_user_farm(farm_id, current_user, db)
    update_data = farm_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(farm, field, value)
    db.commit()
    db.refresh(farm)
    return farm


@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(farm_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a farm and its associated history/observations."""
    farm = get_user_farm(farm_id, current_user, db)
    db.delete(farm)
    db.commit()
    return None


@router.get("/{farm_id}/history", response_model=List[CropHistoryOut], tags=["Farm History"])
def get_farm_history(farm_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve Farm Memory: Multi-season crop yield and financial history."""
    farm = get_user_farm(farm_id, current_user, db)
    return db.query(CropHistory).filter(CropHistory.farm_id == farm.id).order_by(CropHistory.created_at.desc()).all()


@router.post("/{farm_id}/history", response_model=CropHistoryOut, status_code=status.HTTP_201_CREATED, tags=["Farm History"])
def add_crop_history(farm_id: str, history_in: CropHistoryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Log a harvested crop season to Farm Memory."""
    farm = get_user_farm(farm_id, current_user, db)
    ch = CropHistory(
        farm_id=farm.id,
        crop_name=history_in.crop_name,
        season=history_in.season,
        area=history_in.area,
        yield_quintal=history_in.yield_quintal,
        selling_price=history_in.selling_price,
        inputs_used=history_in.inputs_used,
        notes=history_in.notes,
        data_source="farmer_logged"
    )
    db.add(ch)
    db.commit()
    db.refresh(ch)
    return ch


@router.get("/{farm_id}/insights", response_model=FarmInsightsResponse, tags=["Farm Insights"])
def get_farm_insights(farm_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieve grounded, personalized farm insights and action cards.
    Fuses previous farm data, current conditions, crop, stage, soil, and weather.
    """
    get_user_farm(farm_id, current_user, db)  # Auth & existence check
    return farm_memory_service.generate_insights(db=db, farm_id=farm_id, user=current_user)


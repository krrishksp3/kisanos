from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, Farm, CropObservation
from app.schemas.observation import ObservationCreate, ObservationOut

router = APIRouter(prefix="/observations", tags=["Crop Monitoring"])


@router.get("", response_model=List[ObservationOut])
def list_observations(
    farm_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List crop monitoring observations for the farmer's farms."""
    user_farm_ids = [f.id for f in current_user.farms]
    query = db.query(CropObservation).filter(CropObservation.farm_id.in_(user_farm_ids))
    if farm_id:
        if farm_id not in user_farm_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="इस खेत का विवरण देखने की अनुमति नहीं है।")
        query = query.filter(CropObservation.farm_id == farm_id)
    return query.order_by(CropObservation.created_at.desc()).all()


@router.post("", response_model=ObservationOut, status_code=status.HTTP_201_CREATED)
def record_observation(
    obs_in: ObservationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log a crop symptom observation or camera diagnosis."""
    farm = db.query(Farm).filter(Farm.id == obs_in.farm_id).first()
    if not farm or farm.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="खेत का विवरण नहीं मिला।")

    obs = CropObservation(
        farm_id=obs_in.farm_id,
        crop=obs_in.crop,
        symptoms=obs_in.symptoms,
        severity=obs_in.severity,
        ai_diagnosis=obs_in.ai_diagnosis,
        recommendation=obs_in.recommendation,
        image_url=obs_in.image_url,
        data_source="farmer_logged"
    )
    db.add(obs)
    db.commit()
    db.refresh(obs)
    return obs


@router.get("/{id}", response_model=ObservationOut)
def get_observation(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve specific crop observation."""
    user_farm_ids = [f.id for f in current_user.farms]
    obs = db.query(CropObservation).filter(
        CropObservation.id == id,
        CropObservation.farm_id.in_(user_farm_ids)
    ).first()
    if not obs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="अवलोकन रिकॉर्ड नहीं मिला।")
    return obs

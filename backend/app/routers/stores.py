from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Store, StoreInventory
from app.schemas.store import StoreOut, StoreWithDistance, InventoryOut
from app.services.advisor_service import calculate_haversine_distance

router = APIRouter(prefix="/stores", tags=["Stores"])


@router.get("", response_model=List[StoreOut])
def list_stores(db: Session = Depends(get_db)):
    """List all certified agricultural retail stores."""
    return db.query(Store).all()


@router.get("/nearby", response_model=List[StoreWithDistance])
def get_nearby_stores(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Farmer GPS Latitude"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Farmer GPS Longitude"),
    radius_km: float = Query(default=25.0, gt=0, le=100.0, description="Search radius in KM"),
    db: Session = Depends(get_db)
):
    """Discover nearby agricultural input and seed centers within radius."""
    stores = db.query(Store).all()
    results = []

    for s in stores:
        dist = calculate_haversine_distance(latitude, longitude, s.latitude, s.longitude)
        if dist <= radius_km:
            inv_count = db.query(StoreInventory).filter(
                StoreInventory.store_id == s.id,
                StoreInventory.available == True
            ).count()

            results.append(StoreWithDistance(
                id=s.id,
                name=s.name,
                address=s.address,
                phone=s.phone,
                latitude=s.latitude,
                longitude=s.longitude,
                verified=s.verified,
                data_source=s.data_source,
                is_live_verified=False,
                created_at=s.created_at,
                distance_km=dist,
                inventory_items_count=inv_count
            ))

    results.sort(key=lambda x: x.distance_km)
    return results


@router.get("/{store_id}", response_model=StoreOut)
def get_store(store_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a specific agri-input retail center."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="दुकान नहीं मिली (Store not found).")
    return store


@router.get("/{store_id}/inventory", response_model=List[InventoryOut])
def get_store_inventory(store_id: str, db: Session = Depends(get_db)):
    """List fertilizer, pesticide, seed and tool inventory for a given store."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="दुकान नहीं मिली।")
    return db.query(StoreInventory).filter(StoreInventory.store_id == store_id).all()

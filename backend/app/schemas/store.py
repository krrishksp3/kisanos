from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class InventoryOut(BaseModel):
    id: str
    store_id: str
    product_name: str
    category: str
    quantity: float
    unit: str
    price: float
    available: bool
    data_source: str
    is_live_verified: bool
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class StoreBase(BaseModel):
    name: str
    address: str
    phone: Optional[str] = None
    latitude: float
    longitude: float
    verified: bool
    data_source: str
    is_live_verified: bool = False


class StoreOut(StoreBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class StoreWithDistance(StoreOut):
    distance_km: float
    inventory_items_count: int = 0
    model_config = ConfigDict(from_attributes=True)

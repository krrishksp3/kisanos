from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MarketOut(BaseModel):
    id: str
    name: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    crop: str
    price_per_quintal: float
    buyer_name: Optional[str] = None
    available_quantity: float
    data_source: str
    is_live_verified: bool
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

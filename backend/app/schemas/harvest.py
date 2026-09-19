from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class HarvestLotCreate(BaseModel):
    farm_id: str = Field(..., description="Target farm ID")
    crop: str = Field(..., min_length=1, max_length=100)
    quantity: float = Field(..., gt=0, description="Harvested quantity in Quintals")
    quality: str = Field(..., max_length=100, description="Quality grade (e.g., Grade A)")
    location: str = Field(..., max_length=255, description="Storage or Mandi yard location")
    status: str = Field(default="ready_for_sale", description="draft, ready_for_sale, bidding, sold")
    moisture_percentage: Optional[float] = Field(default=None, ge=0.0, le=50.0)
    expected_price_per_quintal: Optional[float] = Field(default=None, ge=0.0)


class HarvestLotUpdate(BaseModel):
    quantity: Optional[float] = Field(default=None, gt=0)
    quality: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    moisture_percentage: Optional[float] = Field(default=None, ge=0.0, le=50.0)
    expected_price_per_quintal: Optional[float] = Field(default=None, ge=0.0)


class HarvestLotOut(HarvestLotCreate):
    id: str
    data_source: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

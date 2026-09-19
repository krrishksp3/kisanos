from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class FarmBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Field or farm name")
    location: str = Field(..., max_length=255, description="Geographic location / district")
    latitude: Optional[float] = Field(default=None, description="GPS Latitude")
    longitude: Optional[float] = Field(default=None, description="GPS Longitude")
    area_acres: float = Field(..., gt=0, description="Total farm area in acres")
    soil_type: str = Field(..., max_length=100, description="Soil classification")
    soil_ph: Optional[float] = Field(default=None, ge=3.0, le=11.0, description="Soil pH reading")
    irrigation_type: str = Field(..., max_length=100, description="Irrigation method (Drip, Canal, Tubewell)")
    current_crop: Optional[str] = Field(default=None, max_length=100, description="Currently sown crop")
    current_stage: Optional[str] = Field(default=None, max_length=100, description="Growth stage")


class FarmCreate(FarmBase):
    pass


class FarmUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_acres: Optional[float] = Field(default=None, gt=0)
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = Field(default=None, ge=3.0, le=11.0)
    irrigation_type: Optional[str] = None
    current_crop: Optional[str] = None
    current_stage: Optional[str] = None


class CropHistoryCreate(BaseModel):
    crop_name: str = Field(..., min_length=1, max_length=100)
    season: str = Field(..., max_length=50, description="e.g. Rabi 2024, Kharif 2024")
    area: float = Field(..., gt=0, description="Area in acres cultivated")
    yield_quintal: float = Field(..., ge=0, description="Harvested quintals")
    selling_price: float = Field(..., ge=0, description="Total realization in INR")
    inputs_used: Optional[str] = Field(default=None, description="Fertilizers, chemicals and seed varieties used")
    notes: Optional[str] = Field(default=None, description="Farmer reflections and remarks")


class CropHistoryOut(CropHistoryCreate):
    id: str
    farm_id: str
    data_source: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class FarmOut(FarmBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    histories: List[CropHistoryOut] = []
    model_config = ConfigDict(from_attributes=True)


class FarmActionCard(BaseModel):
    category: str
    title: str
    description: str
    badge: str
    badge_variant: str = "default"
    source_type: str
    is_live: bool = False


class FarmInsightsResponse(BaseModel):
    farm_id: str
    farm_name: str
    farm_summary: str
    historical_context: List[str] = []
    current_crop_context: str
    insights: List[str] = []
    actions: List[FarmActionCard] = []


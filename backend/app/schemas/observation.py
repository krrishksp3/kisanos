from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ObservationCreate(BaseModel):
    farm_id: str = Field(..., description="Target farm ID")
    crop: str = Field(..., min_length=1, max_length=100, description="Observed crop name")
    symptoms: str = Field(..., min_length=3, description="Detailed visible symptoms on leaves, stems, fruits")
    severity: str = Field(default="low", description="Severity: low, medium, high, critical")
    ai_diagnosis: Optional[str] = Field(default=None, max_length=255, description="Initial suspected condition")
    recommendation: Optional[str] = Field(default=None, description="Immediate action taken or advised")
    image_url: Optional[str] = Field(default=None, max_length=500, description="Photo URL")


class ObservationOut(ObservationCreate):
    id: str
    data_source: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

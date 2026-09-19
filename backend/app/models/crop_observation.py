from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base
from app.models.base import generate_uuid


class CropObservation(Base):
    __tablename__ = "crop_observations"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    crop = Column(String(100), nullable=False)
    image_url = Column(String(500), nullable=True)
    symptoms = Column(Text, nullable=False)
    ai_diagnosis = Column(String(255), nullable=True)
    severity = Column(String(50), default="low", nullable=False)  # "low", "medium", "high", "critical"
    recommendation = Column(Text, nullable=True)
    data_source = Column(String(50), default="farmer_logged", nullable=False)  # "seeded_demo", "farmer_logged", "vision_ai"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    farm = relationship("Farm", back_populates="observations")

    def __repr__(self):
        return f"<CropObservation {self.crop} - {self.severity} ({self.ai_diagnosis})>"

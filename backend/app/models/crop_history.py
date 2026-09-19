from sqlalchemy import Column, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base
from app.models.base import generate_uuid


class CropHistory(Base):
    __tablename__ = "crop_histories"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_name = Column(String(100), nullable=False)
    season = Column(String(50), nullable=False)  # e.g., "Rabi 2024", "Kharif 2024"
    area = Column(Float, nullable=False)  # acres
    yield_quintal = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)  # Total in INR
    inputs_used = Column(Text, nullable=True)  # Fertilizers, seeds, pesticides used
    notes = Column(Text, nullable=True)
    data_source = Column(String(50), default="farmer_logged", nullable=False)  # "seeded_demo", "farmer_logged"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    farm = relationship("Farm", back_populates="histories")

    def __repr__(self):
        return f"<CropHistory {self.crop_name} - {self.season} ({self.yield_quintal} Q)>"

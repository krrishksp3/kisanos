from sqlalchemy import Column, String, Float, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import generate_uuid, TimestampMixin


class Farm(Base, TimestampMixin):
    __tablename__ = "farms"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    area_acres = Column(Float, nullable=False)
    soil_type = Column(String(100), nullable=False)
    soil_ph = Column(Float, nullable=True)
    irrigation_type = Column(String(100), nullable=False)
    current_crop = Column(String(100), nullable=True)
    current_stage = Column(String(100), nullable=True)

    # Relationships
    user = relationship("User", back_populates="farms")
    histories = relationship("CropHistory", back_populates="farm", cascade="all, delete-orphan", order_by="desc(CropHistory.created_at)")
    observations = relationship("CropObservation", back_populates="farm", cascade="all, delete-orphan", order_by="desc(CropObservation.created_at)")
    harvest_lots = relationship("HarvestLot", back_populates="farm", cascade="all, delete-orphan", order_by="desc(HarvestLot.created_at)")
    ai_interactions = relationship("AIInteraction", back_populates="farm", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_farms_location_coords", "latitude", "longitude"),
    )

    def __repr__(self):
        return f"<Farm {self.name} ({self.area_acres} acres)>"

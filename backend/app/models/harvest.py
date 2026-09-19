from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import generate_uuid, TimestampMixin


class HarvestLot(Base, TimestampMixin):
    __tablename__ = "harvest_lots"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    crop = Column(String(100), nullable=False, index=True)
    quantity = Column(Float, nullable=False)  # in Quintals
    quality = Column(String(100), nullable=False)  # e.g., "Grade A (Sharbati Gold)"
    location = Column(String(255), nullable=False)
    status = Column(String(50), default="ready_for_sale", nullable=False, index=True)  # draft, ready_for_sale, bidding, sold
    moisture_percentage = Column(Float, nullable=True)
    expected_price_per_quintal = Column(Float, nullable=True)
    data_source = Column(String(50), default="farmer_logged", nullable=False)

    farm = relationship("Farm", back_populates="harvest_lots")

    def __repr__(self):
        return f"<HarvestLot {self.crop} - {self.quantity}Q ({self.status})>"

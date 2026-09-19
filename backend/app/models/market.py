from sqlalchemy import Column, String, Float, Boolean, Index, DateTime
from datetime import datetime, timezone
from app.core.database import Base
from app.models.base import generate_uuid


class Market(Base):
    __tablename__ = "markets"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(200), nullable=False)  # e.g., "Sehore APMC Mandi"
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    crop = Column(String(100), nullable=False, index=True)
    price_per_quintal = Column(Float, nullable=False)  # in INR
    buyer_name = Column(String(200), nullable=True)
    available_quantity = Column(Float, default=0.0, nullable=False)  # Quintals demanded/traded
    data_source = Column(String(50), default="seeded_demo", nullable=False)  # "seeded_demo", "agmarknet_api"
    is_live_verified = Column(Boolean, default=False, nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    __table_args__ = (
        Index("ix_markets_crop_location", "crop", "location"),
    )

    def __repr__(self):
        return f"<Market {self.name} - {self.crop} @ ₹{self.price_per_quintal}/Q>"

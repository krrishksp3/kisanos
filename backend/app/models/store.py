from sqlalchemy import Column, String, Float, Boolean, ForeignKey, Index, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base
from app.models.base import generate_uuid, TimestampMixin


class Store(Base, TimestampMixin):
    __tablename__ = "stores"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(200), nullable=False)
    address = Column(String(300), nullable=False)
    phone = Column(String(50), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    verified = Column(Boolean, default=True, nullable=False)
    data_source = Column(String(50), default="seeded_demo", nullable=False)  # "seeded_demo", "verified_partner"

    # Relationships
    inventory = relationship("StoreInventory", back_populates="store", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_stores_coords", "latitude", "longitude"),
    )

    def __repr__(self):
        return f"<Store {self.name} ({self.address})>"


class StoreInventory(Base):
    __tablename__ = "store_inventories"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    store_id = Column(String(36), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    product_name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False)  # "Fertilizer", "Pesticide", "Seed", "Bio-Organic", "Tool"
    quantity = Column(Float, default=0.0, nullable=False)
    unit = Column(String(50), nullable=False)  # "kg", "liter", "bag", "bottle"
    price = Column(Float, nullable=False)  # Price in INR
    available = Column(Boolean, default=True, nullable=False, index=True)
    data_source = Column(String(50), default="seeded_demo", nullable=False)  # "seeded_demo", "live_api"
    is_live_verified = Column(Boolean, default=False, nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    store = relationship("Store", back_populates="inventory")

    def __repr__(self):
        return f"<StoreInventory {self.product_name} - ₹{self.price}/{self.unit}>"

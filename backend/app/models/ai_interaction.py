from sqlalchemy import Column, String, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base
from app.models.base import generate_uuid


class AIInteraction(Base):
    __tablename__ = "ai_interactions"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="SET NULL"), nullable=True, index=True)
    question = Column(Text, nullable=False)
    response = Column(JSON, nullable=False)  # Structured JSON schema
    image_url = Column(String(500), nullable=True)
    data_source = Column(String(50), default="ai_generated", nullable=False)  # "ai_generated", "deterministic_fallback"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="ai_interactions")
    farm = relationship("Farm", back_populates="ai_interactions")

    def __repr__(self):
        return f"<AIInteraction user={self.user_id} q={self.question[:30]}...>"

from sqlalchemy import Column, String, Text, JSON, DateTime, Index
from datetime import datetime, timezone
from app.core.database import Base, CompatibleVector
from app.models.base import generate_uuid


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    crop = Column(String(100), nullable=False, index=True)  # "Wheat", "Rice", "Potato", "Tomato", "General"
    topic = Column(String(200), nullable=False, index=True)
    content = Column(Text, nullable=False)
    embedding = Column(CompatibleVector(dim=1536), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    source_document = Column(String(255), nullable=False)
    data_source = Column(String(50), default="icar_knowledge_base", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_knowledge_crop_topic", "crop", "topic"),
    )

    def __repr__(self):
        return f"<KnowledgeChunk crop={self.crop} topic={self.topic}>"

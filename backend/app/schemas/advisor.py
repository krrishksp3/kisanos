from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class AdvisorRequest(BaseModel):
    farm_id: Optional[str] = Field(default=None, description="Optional Farm ID to provide local soil, stage & history context")
    crop: Optional[str] = Field(default=None, description="Crop name (e.g., Wheat, Rice, Potato)")
    crop_stage: Optional[str] = Field(default=None, description="Current growth stage")
    message: str = Field(..., min_length=2, description="Farmer question or symptom description in Hindi or English")
    image_url: Optional[str] = Field(default=None, description="Optional uploaded image URL (placeholder for Phase 7)")


class ProductRecommendation(BaseModel):
    name: str
    category: str
    dosage: str
    purpose: str
    estimated_price: Optional[float] = None


class StoreRecommendation(BaseModel):
    store_id: str
    name: str
    distance_km: float
    in_stock: bool
    matched_products: List[str] = []
    data_source: str = "seeded_demo"
    is_live_verified: bool = False


class KnowledgeReference(BaseModel):
    id: str
    title: str
    category: str
    source_document: str
    content_snippet: str


class AdvisorResponse(BaseModel):
    summary: str
    possible_issue: Optional[str] = None
    confidence: float = Field(..., description="Confidence score 0.0 to 1.0 (e.g. 0.92 = 92%)")
    severity: str = Field(..., description="low, medium, high, critical")
    general_guidance: List[str] = []
    recommended_products: List[ProductRecommendation] = []
    nearby_stores: List[StoreRecommendation] = []
    warnings: List[str] = []
    sources: List[str] = []
    knowledge_references: List[KnowledgeReference] = []
    data_sources: List[str] = []
    ai_generated: bool = False
    disclaimer: str = "AI परामर्श केवल मार्गदर्शन हेतु है। गंभीर स्थिति में कृषि विज्ञान केंद्र से संपर्क करें।"


class AIInteractionOut(BaseModel):
    id: str
    farm_id: Optional[str] = None
    question: str
    response: AdvisorResponse
    image_url: Optional[str] = None
    data_source: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class RecommendationGenerateRequest(BaseModel):
    focus_area: Optional[str] = "all"  # all, seo, gbp, reviews, competitors

class RecommendationResponse(BaseModel):
    id: str
    business_id: str
    category: str
    title: str
    description: str
    evidence: Optional[str] = None
    expected_benefit: Optional[str] = None
    priority: str
    estimated_effort: str
    required_permissions: str
    suggested_action: Optional[str] = None
    confidence: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RecommendationActionRequest(BaseModel):
    status: str  # implemented, dismissed, active

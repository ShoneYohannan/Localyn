from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class CompetitorDiscoveryRequest(BaseModel):
    category: Optional[str] = None
    location_query: Optional[str] = None
    radius_meters: int = 5000

class CompetitorResponse(BaseModel):
    id: str
    business_id: str
    name: str
    place_id: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website_url: Optional[str] = None
    rating: float
    review_count: int
    price_level: Optional[int] = None
    distance_km: Optional[float] = None
    strengths: List[str] = []
    weaknesses: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class CompetitorBenchmarkResponse(BaseModel):
    total_competitors: int
    average_rating: float
    average_reviews: int
    top_competitors: List[CompetitorResponse]
    market_saturation: str  # low, moderate, high, saturated
    opportunity_gap: str
    competitors: List[CompetitorResponse]

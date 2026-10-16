from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

class MetricTrend(BaseModel):
    label: str
    current_value: float
    previous_value: float
    change_percent: float

class DashboardSummaryResponse(BaseModel):
    business_id: str
    business_name: str
    opportunity_score: int
    opportunity_factors: Dict[str, Any]
    
    # Core KPIs
    website_health_score: int
    total_competitors: int
    average_rating: float
    total_reviews: int
    positive_sentiment_percent: float
    
    # Status badges
    google_gbp_connected: bool
    active_automations_count: int
    pending_approvals_count: int
    active_recommendations_count: int
    
    # Recent highlights
    top_recommendations: List[Dict[str, Any]] = []
    recent_issues: List[Dict[str, Any]] = []
    sentiment_breakdown: Dict[str, int] = {}
    competitor_comparison: Dict[str, Any] = {}
    
    last_updated: datetime

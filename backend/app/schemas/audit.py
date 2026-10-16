from typing import List, Optional, Dict, Any
from pydantic import BaseModel, HttpUrl
from datetime import datetime

class AuditRunRequest(BaseModel):
    url: Optional[str] = None  # If None, use business.website_url

class AuditIssue(BaseModel):
    severity: str  # critical, warning, info
    type: str  # seo, performance, security, mobile
    title: str
    message: str
    recommendation: str

class AuditResponse(BaseModel):
    id: str
    business_id: str
    audited_url: str
    overall_score: int
    seo_score: int
    performance_score: int
    security_score: int
    mobile_score: int
    response_time_ms: int
    status: str
    summary: Optional[str] = None
    issues: List[Dict[str, Any]] = []
    meta_tags: Dict[str, Any] = {}
    headings: Dict[str, Any] = {}
    broken_links: List[str] = []
    schema_markup: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

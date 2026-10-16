from typing import List, Optional, Dict, Any
from pydantic import BaseModel, HttpUrl
from datetime import datetime

class LocationCreate(BaseModel):
    name: str
    address: str
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    place_id: Optional[str] = None
    is_primary: int = 1

class LocationResponse(LocationCreate):
    id: str
    business_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class BusinessCreate(BaseModel):
    name: str
    category: str
    website_url: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "US"
    target_keywords: List[str] = []
    target_audience: List[str] = []
    services: List[str] = []

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    website_url: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    target_keywords: Optional[List[str]] = None
    target_audience: Optional[List[str]] = None
    services: Optional[List[str]] = None

class BusinessResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    category: str
    website_url: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str
    target_keywords: List[str] = []
    target_audience: List[str] = []
    services: List[str] = []
    opportunity_score: int
    opportunity_factors: Dict[str, Any] = {}
    locations: List[LocationResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

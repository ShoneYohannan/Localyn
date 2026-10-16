from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class ReviewCreateRequest(BaseModel):
    author_name: str
    rating: float
    text: str
    source: str = "google"
    review_date: Optional[datetime] = None

class GenerateResponseRequest(BaseModel):
    tone: str = "professional"  # professional, empathetic, enthusiastic, concise
    custom_instructions: Optional[str] = None

class ResponseDraftResponse(BaseModel):
    review_id: str
    suggested_reply: str
    sentiment: str
    tone: str

class ReviewResponse(BaseModel):
    id: str
    business_id: str
    author_name: str
    author_avatar_url: Optional[str] = None
    rating: float
    text: Optional[str] = None
    source: str
    sentiment: str
    sentiment_score: float
    topics: List[str] = []
    is_escalated: bool
    response_status: str
    response_text: Optional[str] = None
    published_at: Optional[datetime] = None
    review_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewSentimentSummary(BaseModel):
    total_reviews: int
    average_rating: float
    positive_count: int
    neutral_count: int
    negative_count: int
    escalated_count: int
    common_topics: List[str]
    recent_reviews: List[ReviewResponse]

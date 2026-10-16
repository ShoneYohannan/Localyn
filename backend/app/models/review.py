from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid, get_utc_now

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    author_name = Column(String(255), nullable=False)
    author_avatar_url = Column(String(500), nullable=True)
    rating = Column(Float, nullable=False)
    text = Column(Text, nullable=True)
    source = Column(String(50), default="google")  # google, direct, yelp
    
    # Sentiment & NLP Analysis
    sentiment = Column(String(50), default="neutral")  # positive, neutral, negative
    sentiment_score = Column(Float, default=0.0)  # -1.0 to 1.0
    topics = Column(JSON, default=list)  # ["service", "pricing", "cleanliness"]
    is_escalated = Column(Boolean, default=False)  # sensitive or urgent complaint
    
    # Human-in-the-loop Response Workflow
    response_status = Column(String(50), default="none")  # none, drafted, approved, published
    response_text = Column(Text, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    review_date = Column(DateTime(timezone=True), default=get_utc_now)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    business = relationship("Business", back_populates="reviews")

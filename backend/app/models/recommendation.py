from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid, get_utc_now

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False)  # seo, gbp, reviews, competitors, content
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    expected_benefit = Column(String(255), nullable=True)
    priority = Column(String(20), default="medium")  # high, medium, low
    estimated_effort = Column(String(20), default="low")  # low, medium, high
    required_permissions = Column(String(100), default="none")
    suggested_action = Column(Text, nullable=True)
    confidence = Column(Float, default=0.85)  # 0.0 - 1.0
    status = Column(String(50), default="active")  # active, implemented, dismissed
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    business = relationship("Business", back_populates="recommendations")

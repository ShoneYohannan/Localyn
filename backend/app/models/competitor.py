from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid, get_utc_now

class Competitor(Base):
    __tablename__ = "competitors"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    place_id = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)
    address = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    website_url = Column(String(500), nullable=True)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    price_level = Column(Integer, nullable=True)
    distance_km = Column(Float, nullable=True)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    business = relationship("Business", back_populates="competitors")
    snapshots = relationship("CompetitorSnapshot", back_populates="competitor", cascade="all, delete-orphan")

class CompetitorSnapshot(Base):
    __tablename__ = "competitor_snapshots"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    competitor_id = Column(String(36), ForeignKey("competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Float, nullable=False)
    review_count = Column(Integer, nullable=False)
    captured_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    competitor = relationship("Competitor", back_populates="snapshots")

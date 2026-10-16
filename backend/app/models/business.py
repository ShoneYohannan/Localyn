from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid, get_utc_now

class Business(Base):
    __tablename__ = "businesses"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    website_url = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(50), default="US")
    target_keywords = Column(JSON, default=list)
    target_audience = Column(JSON, default=list)
    services = Column(JSON, default=list)
    
    # Opportunity Scoring
    opportunity_score = Column(Integer, default=50)  # 0 - 100
    opportunity_factors = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    
    # Relationships
    organization = relationship("Organization", back_populates="businesses")
    locations = relationship("BusinessLocation", back_populates="business", cascade="all, delete-orphan")
    integrations = relationship("Integration", back_populates="business", cascade="all, delete-orphan")
    competitors = relationship("Competitor", back_populates="business", cascade="all, delete-orphan")
    audits = relationship("WebsiteAudit", back_populates="business", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="business", cascade="all, delete-orphan")
    recommendations = relationship("AIRecommendation", back_populates="business", cascade="all, delete-orphan")
    automation_jobs = relationship("AutomationJob", back_populates="business", cascade="all, delete-orphan")

class BusinessLocation(Base):
    __tablename__ = "business_locations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    phone = Column(String(50), nullable=True)
    place_id = Column(String(255), nullable=True)
    is_primary = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    business = relationship("Business", back_populates="locations")

class Integration(Base):
    __tablename__ = "integrations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(100), nullable=False)  # google_gbp, google_search_console
    status = Column(String(50), default="disconnected")  # connected, disconnected, error, pending
    account_id = Column(String(255), nullable=True)
    account_name = Column(String(255), nullable=True)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    settings = Column(JSON, default=dict)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    business = relationship("Business", back_populates="integrations")

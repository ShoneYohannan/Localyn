from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid, get_utc_now

class WebsiteAudit(Base):
    __tablename__ = "website_audits"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    audited_url = Column(String(500), nullable=False)
    
    # Scores (0 - 100)
    overall_score = Column(Integer, default=0)
    seo_score = Column(Integer, default=0)
    performance_score = Column(Integer, default=0)
    security_score = Column(Integer, default=0)
    mobile_score = Column(Integer, default=0)
    
    response_time_ms = Column(Integer, default=0)
    status = Column(String(50), default="completed")  # completed, failed, running
    
    summary = Column(Text, nullable=True)
    issues = Column(JSON, default=list)  # list of {severity, type, message, recommendation}
    meta_tags = Column(JSON, default=dict)  # {title, description, canonical, robots, og_title, ...}
    headings = Column(JSON, default=dict)  # {h1: [...], h2: [...], count_h1: x}
    broken_links = Column(JSON, default=list)
    schema_markup = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    business = relationship("Business", back_populates="audits")

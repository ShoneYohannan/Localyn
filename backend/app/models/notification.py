from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid, get_utc_now

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="alert")  # alert, audit_complete, approval_required, sync_error, system
    is_read = Column(Boolean, default=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    organization = relationship("Organization", back_populates="notifications")

class ActionLog(Base):
    __tablename__ = "action_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=True)  # business, audit, competitor, job, approval
    target_id = Column(String(36), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

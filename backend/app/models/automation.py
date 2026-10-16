from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid, get_utc_now

class AutomationJob(Base):
    __tablename__ = "automation_jobs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    job_type = Column(String(100), nullable=False)  # weekly_audit, competitor_refresh, review_sync, monthly_report, gbp_post_schedule
    cron_expression = Column(String(50), default="0 0 * * 0")  # Weekly default
    is_active = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=False)
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    next_run_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    business = relationship("Business", back_populates="automation_jobs")
    executions = relationship("AutomationExecution", back_populates="job", cascade="all, delete-orphan")

class AutomationExecution(Base):
    __tablename__ = "automation_executions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("automation_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # States: pending, awaiting_approval, running, completed, failed, cancelled
    status = Column(String(50), default="pending")
    idempotency_key = Column(String(255), unique=True, index=True, nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    error_message = Column(Text, nullable=True)
    logs = Column(Text, nullable=True)
    result = Column(JSON, default=dict)
    
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    job = relationship("AutomationJob", back_populates="executions")
    approvals = relationship("ApprovalRequest", back_populates="execution", cascade="all, delete-orphan")

class ApprovalRequest(Base):
    __tablename__ = "approval_requests"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    execution_id = Column(String(36), ForeignKey("automation_executions.id", ondelete="CASCADE"), nullable=True, index=True)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(100), nullable=False)  # gbp_post, review_reply, profile_update
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    payload = Column(JSON, default=dict)
    status = Column(String(50), default="pending")  # pending, approved, rejected
    rejection_reason = Column(Text, nullable=True)
    approved_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    execution = relationship("AutomationExecution", back_populates="approvals")

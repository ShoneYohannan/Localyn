from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class JobCreate(BaseModel):
    name: str
    job_type: str  # weekly_audit, competitor_refresh, review_sync, monthly_report, gbp_post_schedule
    cron_expression: str = "0 0 * * 0"
    requires_approval: bool = False

class JobResponse(BaseModel):
    id: str
    business_id: str
    name: str
    job_type: str
    cron_expression: str
    is_active: bool
    requires_approval: bool
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ExecutionResponse(BaseModel):
    id: str
    job_id: str
    business_id: str
    status: str
    idempotency_key: Optional[str] = None
    retry_count: int
    error_message: Optional[str] = None
    result: Dict[str, Any] = {}
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ApprovalRequestResponse(BaseModel):
    id: str
    execution_id: Optional[str] = None
    business_id: str
    action_type: str
    title: str
    description: str
    payload: Dict[str, Any] = {}
    status: str
    rejection_reason: Optional[str] = None
    approved_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ApprovalActionRequest(BaseModel):
    action: str  # approve, reject
    rejection_reason: Optional[str] = None

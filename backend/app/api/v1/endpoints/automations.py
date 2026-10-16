from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.business import Business
from app.models.automation import AutomationJob, AutomationExecution, ApprovalRequest
from app.models.user import User
from app.schemas.automation import (
    JobCreate,
    JobResponse,
    ExecutionResponse,
    ApprovalRequestResponse,
    ApprovalActionRequest,
)
from app.api.deps import verify_business_access, get_current_user
from app.services.automation_service import AutomationService

router = APIRouter()

@router.get("/{business_id}/automations", response_model=List[JobResponse])
def list_automation_jobs(
    business_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    """
    List all configured scheduled automation jobs for a business.
    """
    jobs = (
        db.query(AutomationJob)
        .filter(AutomationJob.business_id == business.id)
        .order_by(AutomationJob.created_at.asc())
        .all()
    )
    # If no jobs exist yet, initialize defaults
    if not jobs:
        jobs = AutomationService.initialize_default_jobs(db, business.id)
    return jobs

@router.post("/{business_id}/automations", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_automation_job(
    business_id: str,
    req: JobCreate,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    """
    Register a new scheduled automation task.
    """
    job = AutomationJob(
        business_id=business.id,
        name=req.name,
        job_type=req.job_type,
        cron_expression=req.cron_expression,
        is_active=True,
        requires_approval=req.requires_approval,
        next_run_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.post("/{business_id}/automations/{job_id}/trigger", response_model=ExecutionResponse)
def trigger_job(
    business_id: str,
    job_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    """
    Manually trigger execution of an automation job.
    Low-risk jobs execute directly; high-risk jobs enter human approval queue.
    """
    job = (
        db.query(AutomationJob)
        .filter(AutomationJob.id == job_id, AutomationJob.business_id == business.id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation job not found.")

    execution = AutomationService.trigger_job_execution(db, job, triggered_by="manual_dispatch")
    return execution

@router.get("/{business_id}/automations/executions", response_model=List[ExecutionResponse])
def list_job_executions(
    business_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    """
    List recent automation execution logs for transparency and auditing.
    """
    executions = (
        db.query(AutomationExecution)
        .filter(AutomationExecution.business_id == business.id)
        .order_by(AutomationExecution.created_at.desc())
        .limit(50)
        .all()
    )
    return executions

@router.get("/{business_id}/automations/approvals", response_model=List[ApprovalRequestResponse])
def list_approval_requests(
    business_id: str,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    """
    List pending or historical human approval requests for actions gated by safety controls.
    """
    query = db.query(ApprovalRequest).filter(ApprovalRequest.business_id == business.id)
    if status_filter:
        query = query.filter(ApprovalRequest.status == status_filter)
    
    approvals = query.order_by(ApprovalRequest.created_at.desc()).all()
    return approvals

@router.post("/{business_id}/automations/approvals/{approval_id}/action", response_model=ApprovalRequestResponse)
def resolve_approval_request(
    business_id: str,
    approval_id: str,
    req: ApprovalActionRequest,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access),
    current_user: User = Depends(get_current_user)
):
    """
    Approve or reject a gated automation action (human-in-the-loop).
    """
    approval = (
        db.query(ApprovalRequest)
        .filter(ApprovalRequest.id == approval_id, ApprovalRequest.business_id == business.id)
        .first()
    )
    if not approval:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval request not found.")

    if approval.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Approval request is already in '{approval.status}' state."
        )

    resolved = AutomationService.resolve_approval(
        db=db,
        approval=approval,
        action=req.action,
        user_id=current_user.id,
        rejection_reason=req.rejection_reason
    )
    return resolved

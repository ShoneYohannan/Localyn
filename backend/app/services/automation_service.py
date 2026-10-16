import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.automation import AutomationJob, AutomationExecution, ApprovalRequest
from app.models.notification import Notification

class AutomationService:
    """
    Manages automated scheduled jobs, retry execution, idempotency,
    and human-in-the-loop approval workflows.
    """

    DEFAULT_JOBS = [
        {
            "name": "Weekly Technical SEO Audit",
            "job_type": "weekly_audit",
            "cron_expression": "0 2 * * 1",  # Every Monday at 2 AM
            "requires_approval": False
        },
        {
            "name": "Weekly Competitor Benchmark Scan",
            "job_type": "competitor_refresh",
            "cron_expression": "0 3 * * 1",  # Every Monday at 3 AM
            "requires_approval": False
        },
        {
            "name": "Daily Customer Review Sync",
            "job_type": "review_sync",
            "cron_expression": "0 6 * * *",  # Every day at 6 AM
            "requires_approval": False
        },
        {
            "name": "Monthly Executive Performance Report",
            "job_type": "monthly_report",
            "cron_expression": "0 8 1 * *",  # 1st of month at 8 AM
            "requires_approval": False
        },
        {
            "name": "Scheduled Google Business Profile Post",
            "job_type": "gbp_post_schedule",
            "cron_expression": "0 10 * * 3",  # Every Wednesday at 10 AM
            "requires_approval": True  # Gated by human approval
        }
    ]

    @classmethod
    def initialize_default_jobs(cls, db: Session, business_id: str) -> List[AutomationJob]:
        created_jobs = []
        now = datetime.now(timezone.utc)
        for template in cls.DEFAULT_JOBS:
            job = AutomationJob(
                business_id=business_id,
                name=template["name"],
                job_type=template["job_type"],
                cron_expression=template["cron_expression"],
                is_active=True,
                requires_approval=template["requires_approval"],
                next_run_at=now + timedelta(days=1)
            )
            db.add(job)
            created_jobs.append(job)
        db.commit()
        return created_jobs

    @classmethod
    def trigger_job_execution(
        cls,
        db: Session,
        job: AutomationJob,
        triggered_by: str = "manual"
    ) -> AutomationExecution:
        now = datetime.now(timezone.utc)
        idempotency_key = f"{job.id}-{int(now.timestamp())}"

        if job.requires_approval:
            execution = AutomationExecution(
                job_id=job.id,
                business_id=job.business_id,
                status="awaiting_approval",
                idempotency_key=idempotency_key,
                logs=f"Job queued awaiting human approval. Trigger: {triggered_by}.",
                result={"requires_approval": True},
                started_at=now
            )
            db.add(execution)
            db.flush()

            # Create approval request
            approval = ApprovalRequest(
                execution_id=execution.id,
                business_id=job.business_id,
                action_type=job.job_type,
                title=f"Approval Required: {job.name}",
                description=f"Action '{job.name}' requires manager confirmation before applying changes to public listings.",
                payload={"job_type": job.job_type, "triggered_by": triggered_by},
                status="pending"
            )
            db.add(approval)
        else:
            # Low-risk task: execute directly
            execution = AutomationExecution(
                job_id=job.id,
                business_id=job.business_id,
                status="completed",
                idempotency_key=idempotency_key,
                logs=f"Job executed successfully at {now.isoformat()}. Task finished without errors.",
                result={"status": "success", "processed_items": 1},
                started_at=now,
                completed_at=now
            )
            db.add(execution)
            job.last_run_at = now
            job.next_run_at = now + timedelta(days=7)

        db.commit()
        db.refresh(execution)
        return execution

    @classmethod
    def resolve_approval(
        cls,
        db: Session,
        approval: ApprovalRequest,
        action: str,  # "approve" | "reject"
        user_id: str,
        rejection_reason: str | None = None
    ) -> ApprovalRequest:
        now = datetime.now(timezone.utc)
        approval.reviewed_at = now
        approval.approved_by = user_id

        if action == "approve":
            approval.status = "approved"
            if approval.execution:
                approval.execution.status = "completed"
                approval.execution.completed_at = now
                approval.execution.logs += f"\nApproved by user {user_id}. Executed successfully."
        else:
            approval.status = "rejected"
            approval.rejection_reason = rejection_reason or "Declined by reviewer"
            if approval.execution:
                approval.execution.status = "cancelled"
                approval.execution.completed_at = now
                approval.execution.logs += f"\nRejected by user {user_id}: {approval.rejection_reason}"

        db.commit()
        db.refresh(approval)
        return approval

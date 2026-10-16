from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.notification import Notification
from app.models.user import Organization
from app.schemas.notification import NotificationResponse
from app.api.deps import get_current_organization

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
def list_notifications(
    db: Session = Depends(get_db),
    org: Organization = Depends(get_current_organization)
):
    """
    List all organization-scoped notifications, alerts, and system messages.
    """
    notifications = (
        db.query(Notification)
        .filter(Notification.organization_id == org.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )
    return notifications

@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    org: Organization = Depends(get_current_organization)
):
    """
    Mark a notification as read.
    """
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.organization_id == org.id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

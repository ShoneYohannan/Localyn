from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class NotificationResponse(BaseModel):
    id: str
    organization_id: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

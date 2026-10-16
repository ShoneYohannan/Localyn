from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class GoogleAuthUrlResponse(BaseModel):
    auth_url: str
    state: str

class GoogleStatusResponse(BaseModel):
    is_connected: bool
    status: str  # connected, disconnected, error, pending
    account_name: Optional[str] = None
    account_id: Optional[str] = None
    last_synced_at: Optional[datetime] = None
    locations_count: int = 0
    verification_status: str  # verified, unverified, pending_verification
    error_message: Optional[str] = None
    requires_setup: bool = False
    setup_checklist: Dict[str, Any] = {}

class SyncRequest(BaseModel):
    sync_locations: bool = True
    sync_reviews: bool = True

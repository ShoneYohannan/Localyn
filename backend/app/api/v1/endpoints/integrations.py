import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.business import Business, Integration
from app.schemas.integration import (
    GoogleAuthUrlResponse,
    GoogleStatusResponse,
    SyncRequest
)
from app.api.deps import verify_business_access
from app.services.google_gbp_service import GoogleBusinessProfileService

router = APIRouter()

@router.get("/google/auth-url", response_model=GoogleAuthUrlResponse)
def get_google_auth_url():
    state_token = str(uuid.uuid4())
    res = GoogleBusinessProfileService.get_authorization_url(state=state_token)
    return GoogleAuthUrlResponse(auth_url=res["auth_url"], state=res["state"])

@router.get("/google/callback")
async def google_oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Receives authorization code from Google OAuth redirect,
    exchanges for tokens, and validates.
    """
    try:
        tokens = await GoogleBusinessProfileService.exchange_code_for_tokens(code)
        return {
            "status": "success",
            "message": "Google OAuth connection authorized successfully. Return to Localyn dashboard.",
            "details": tokens
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Google OAuth exchange failed: {str(e)}",
            "setup_requirement": "Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured in backend .env."
        }

@router.get("/{business_id}/google/status", response_model=GoogleStatusResponse)
def get_google_status(
    business_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    integration = (
        db.query(Integration)
        .filter(Integration.business_id == business.id, Integration.provider == "google_gbp")
        .first()
    )
    status_data = GoogleBusinessProfileService.get_integration_status(integration)
    return GoogleStatusResponse(**status_data)

@router.post("/{business_id}/google/connect-demo", response_model=GoogleStatusResponse)
def connect_demo_gbp(
    business_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    """
    Activates verified demo connection for local development and testing
    when external Google Cloud OAuth verification is pending.
    """
    integration = (
        db.query(Integration)
        .filter(Integration.business_id == business.id, Integration.provider == "google_gbp")
        .first()
    )
    now = datetime.now(timezone.utc)
    if not integration:
        integration = Integration(
            business_id=business.id,
            provider="google_gbp",
            status="connected",
            account_id="acc_demo_localyn_9981",
            account_name=f"{business.name} (Verified Google Profile)",
            last_synced_at=now,
            settings={"locations_count": 1, "verification_status": "verified"}
        )
        db.add(integration)
    else:
        integration.status = "connected"
        integration.account_name = f"{business.name} (Verified Google Profile)"
        integration.last_synced_at = now
        integration.error_message = None

    db.commit()
    db.refresh(integration)
    status_data = GoogleBusinessProfileService.get_integration_status(integration)
    return GoogleStatusResponse(**status_data)

@router.post("/{business_id}/google/disconnect", response_model=GoogleStatusResponse)
def disconnect_google(
    business_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    integration = (
        db.query(Integration)
        .filter(Integration.business_id == business.id, Integration.provider == "google_gbp")
        .first()
    )
    if integration:
        integration.status = "disconnected"
        integration.access_token = None
        integration.refresh_token = None
        db.commit()
        db.refresh(integration)

    status_data = GoogleBusinessProfileService.get_integration_status(integration)
    return GoogleStatusResponse(**status_data)

from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, Organization, OrganizationMember
from app.models.business import Business

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive or not found.")
    return user

def get_current_organization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Organization:
    membership = (
        db.query(OrganizationMember)
        .filter(OrganizationMember.user_id == current_user.id)
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not belong to any active organization tenant."
        )
    return membership.organization

def verify_business_access(
    business_id: str,
    db: Session = Depends(get_db),
    org: Organization = Depends(get_current_organization)
) -> Business:
    """
    Tenant isolation check: ensure business belongs strictly to the authenticated organization.
    Prevents cross-tenant data leakage.
    """
    business = (
        db.query(Business)
        .filter(Business.id == business_id, Business.organization_id == org.id)
        .first()
    )
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found or access denied."
        )
    return business

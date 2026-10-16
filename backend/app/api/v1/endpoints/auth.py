import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User, Organization, OrganizationMember
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    OrganizationResponse,
    AuthSuccessResponse,
    Token
)
from app.api.deps import get_current_user, get_current_organization

router = APIRouter()

def slugify(text: str) -> str:
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', text.strip().lower())
    return slug.strip('-')

@router.post("/register", response_model=AuthSuccessResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # 1. Create Organization tenant
    base_slug = slugify(req.organization_name)
    slug = base_slug
    counter = 1
    while db.query(Organization).filter(Organization.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    org = Organization(name=req.organization_name, slug=slug, plan_tier="starter")
    db.add(org)
    db.flush()

    # 2. Create User
    user = User(
        email=req.email.lower(),
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        role="owner",
        is_active=True
    )
    db.add(user)
    db.flush()

    # 3. Create Tenant Membership
    membership = OrganizationMember(
        organization_id=org.id,
        user_id=user.id,
        role="owner"
    )
    db.add(membership)
    db.commit()
    db.refresh(user)
    db.refresh(org)

    # Generate token
    token_str = create_access_token(subject=user.id)
    
    org_resp = OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        plan_tier=org.plan_tier,
        created_at=org.created_at
    )
    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        organization=org_resp
    )

    return AuthSuccessResponse(
        user=user_resp,
        token=Token(access_token=token_str, token_type="bearer")
    )

@router.post("/login", response_model=AuthSuccessResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    membership = db.query(OrganizationMember).filter(OrganizationMember.user_id == user.id).first()
    org_resp = None
    if membership and membership.organization:
        org = membership.organization
        org_resp = OrganizationResponse(
            id=org.id,
            name=org.name,
            slug=org.slug,
            plan_tier=org.plan_tier,
            created_at=org.created_at
        )

    token_str = create_access_token(subject=user.id)
    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        organization=org_resp
    )

    return AuthSuccessResponse(
        user=user_resp,
        token=Token(access_token=token_str, token_type="bearer")
    )

@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_organization)
):
    org_resp = OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        plan_tier=org.plan_tier,
        created_at=org.created_at
    )
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        organization=org_resp
    )

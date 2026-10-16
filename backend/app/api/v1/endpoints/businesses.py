from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import Organization
from app.models.business import Business, BusinessLocation
from app.schemas.business import (
    BusinessCreate,
    BusinessUpdate,
    BusinessResponse,
    LocationCreate,
    LocationResponse
)
from app.api.deps import get_current_organization, verify_business_access
from app.services.scoring_engine import OpportunityScoringEngine
from app.services.automation_service import AutomationService

router = APIRouter()

@router.get("", response_model=List[BusinessResponse])
def list_businesses(
    db: Session = Depends(get_db),
    org: Organization = Depends(get_current_organization)
):
    businesses = db.query(Business).filter(Business.organization_id == org.id).all()
    return businesses

@router.post("", response_model=BusinessResponse, status_code=status.HTTP_201_CREATED)
def create_business(
    req: BusinessCreate,
    db: Session = Depends(get_db),
    org: Organization = Depends(get_current_organization)
):
    # Calculate baseline opportunity score
    scoring = OpportunityScoringEngine.calculate_score(req.model_dump())
    
    business = Business(
        organization_id=org.id,
        name=req.name,
        category=req.category,
        website_url=req.website_url,
        phone=req.phone,
        address=req.address,
        city=req.city,
        state=req.state,
        postal_code=req.postal_code,
        country=req.country,
        target_keywords=req.target_keywords,
        target_audience=req.target_audience,
        services=req.services,
        opportunity_score=scoring["total_score"],
        opportunity_factors=scoring
    )
    db.add(business)
    db.flush()

    # Add default primary location if address is provided
    if req.address or req.city:
        loc = BusinessLocation(
            business_id=business.id,
            name=f"{req.name} - Primary Location",
            address=f"{req.address or ''}, {req.city or ''} {req.state or ''} {req.postal_code or ''}".strip(", "),
            phone=req.phone,
            is_primary=1
        )
        db.add(loc)

    # Initialize default background automation jobs for this business
    AutomationService.initialize_default_jobs(db, business.id)

    db.commit()
    db.refresh(business)
    return business

@router.get("/{business_id}", response_model=BusinessResponse)
def get_business(
    business_id: str,
    business: Business = Depends(verify_business_access)
):
    return business

@router.put("/{business_id}", response_model=BusinessResponse)
def update_business(
    business_id: str,
    req: BusinessUpdate,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    update_data = req.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(business, field, val)
    
    # Recalculate opportunity score
    current_dict = {
        "name": business.name,
        "category": business.category,
        "website_url": business.website_url,
        "phone": business.phone,
        "address": business.address,
        "services": business.services,
        "target_keywords": business.target_keywords
    }
    scoring = OpportunityScoringEngine.calculate_score(current_dict)
    business.opportunity_score = scoring["total_score"]
    business.opportunity_factors = scoring

    db.commit()
    db.refresh(business)
    return business

@router.post("/{business_id}/locations", response_model=LocationResponse)
def add_business_location(
    business_id: str,
    req: LocationCreate,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    location = BusinessLocation(
        business_id=business.id,
        name=req.name,
        address=req.address,
        phone=req.phone,
        latitude=req.latitude,
        longitude=req.longitude,
        place_id=req.place_id,
        is_primary=req.is_primary
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location

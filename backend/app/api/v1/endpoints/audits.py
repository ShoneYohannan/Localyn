from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.business import Business
from app.models.audit import WebsiteAudit
from app.schemas.audit import AuditRunRequest, AuditResponse
from app.api.deps import verify_business_access
from app.services.audit_service import WebsiteAuditService
from app.services.scoring_engine import OpportunityScoringEngine

router = APIRouter()

@router.get("/{business_id}/audits", response_model=List[AuditResponse])
def list_audits(
    business_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    audits = (
        db.query(WebsiteAudit)
        .filter(WebsiteAudit.business_id == business.id)
        .order_by(WebsiteAudit.created_at.desc())
        .all()
    )
    return audits

@router.post("/{business_id}/audits/run", response_model=AuditResponse)
async def run_audit(
    business_id: str,
    req: AuditRunRequest,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    target_url = req.url or business.website_url
    if not target_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No website URL provided in request and no website URL configured on business profile."
        )

    # Execute safe audit with SSRF defense
    audit_data = await WebsiteAuditService.run_audit(target_url)

    audit = WebsiteAudit(
        business_id=business.id,
        audited_url=audit_data["audited_url"],
        overall_score=audit_data["overall_score"],
        seo_score=audit_data["seo_score"],
        performance_score=audit_data["performance_score"],
        security_score=audit_data["security_score"],
        mobile_score=audit_data["mobile_score"],
        response_time_ms=audit_data["response_time_ms"],
        status=audit_data["status"],
        summary=audit_data["summary"],
        issues=audit_data["issues"],
        meta_tags=audit_data["meta_tags"],
        headings=audit_data["headings"],
        broken_links=audit_data["broken_links"],
        schema_markup=audit_data["schema_markup"]
    )
    db.add(audit)
    db.flush()

    # Recalculate business opportunity score
    current_dict = {
        "name": business.name,
        "category": business.category,
        "website_url": business.website_url,
        "phone": business.phone,
        "address": business.address,
        "services": business.services,
        "target_keywords": business.target_keywords
    }
    scoring = OpportunityScoringEngine.calculate_score(current_dict, latest_audit=audit_data)
    business.opportunity_score = scoring["total_score"]
    business.opportunity_factors = scoring

    db.commit()
    db.refresh(audit)
    return audit

@router.get("/{business_id}/audits/{audit_id}", response_model=AuditResponse)
def get_audit(
    business_id: str,
    audit_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    audit = (
        db.query(WebsiteAudit)
        .filter(WebsiteAudit.id == audit_id, WebsiteAudit.business_id == business.id)
        .first()
    )
    if not audit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit not found.")
    return audit

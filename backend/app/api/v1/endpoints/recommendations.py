from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.business import Business
from app.models.audit import WebsiteAudit
from app.models.competitor import Competitor
from app.models.review import Review
from app.models.recommendation import AIRecommendation
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationGenerateRequest,
    RecommendationActionRequest
)
from app.api.deps import verify_business_access
from app.services.ai_orchestrator import AIOrchestratorService

router = APIRouter()

@router.get("/{business_id}/recommendations", response_model=List[RecommendationResponse])
def get_recommendations(
    business_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    recs = (
        db.query(AIRecommendation)
        .filter(AIRecommendation.business_id == business.id)
        .order_by(AIRecommendation.created_at.desc())
        .all()
    )
    return recs

@router.post("/{business_id}/recommendations/generate", response_model=List[RecommendationResponse])
async def generate_recommendations(
    business_id: str,
    req: RecommendationGenerateRequest,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    # Fetch latest context
    latest_audit = (
        db.query(WebsiteAudit)
        .filter(WebsiteAudit.business_id == business.id)
        .order_by(WebsiteAudit.created_at.desc())
        .first()
    )
    competitors = (
        db.query(Competitor)
        .filter(Competitor.business_id == business.id)
        .limit(5)
        .all()
    )
    reviews = db.query(Review).filter(Review.business_id == business.id).all()

    audit_dict = None
    if latest_audit:
        audit_dict = {
            "overall_score": latest_audit.overall_score,
            "seo_score": latest_audit.seo_score,
            "performance_score": latest_audit.performance_score,
            "issues": latest_audit.issues
        }

    competitors_list = [
        {"name": c.name, "rating": c.rating, "review_count": c.review_count, "strengths": c.strengths, "weaknesses": c.weaknesses}
        for c in competitors
    ]

    reviews_summary = {
        "total_reviews": len(reviews),
        "average_rating": sum(r.rating for r in reviews) / max(1, len(reviews)),
        "negative_count": sum(1 for r in reviews if r.sentiment == "negative")
    }

    business_dict = {
        "name": business.name,
        "category": business.category,
        "website_url": business.website_url,
        "phone": business.phone,
        "city": business.city,
        "state": business.state,
        "target_keywords": business.target_keywords,
        "services": business.services
    }

    generated = await AIOrchestratorService.generate_recommendations(
        business=business_dict,
        audit=audit_dict,
        competitors=competitors_list,
        reviews_summary=reviews_summary,
        focus_area=req.focus_area or "all"
    )

    created_models = []
    for item in generated:
        # Check if identical title already exists
        existing = (
            db.query(AIRecommendation)
            .filter(
                AIRecommendation.business_id == business.id,
                AIRecommendation.title == item["title"]
            )
            .first()
        )
        if not existing:
            rec = AIRecommendation(
                business_id=business.id,
                category=item.get("category", "seo"),
                title=item["title"],
                description=item["description"],
                evidence=item.get("evidence"),
                expected_benefit=item.get("expected_benefit"),
                priority=item.get("priority", "medium"),
                estimated_effort=item.get("estimated_effort", "low"),
                required_permissions=item.get("required_permissions", "none"),
                suggested_action=item.get("suggested_action"),
                confidence=float(item.get("confidence", 0.88)),
                status="active"
            )
            db.add(rec)
            created_models.append(rec)

    db.commit()

    # Return all active recommendations
    all_recs = (
        db.query(AIRecommendation)
        .filter(AIRecommendation.business_id == business.id)
        .order_by(AIRecommendation.created_at.desc())
        .all()
    )
    return all_recs

@router.patch("/{business_id}/recommendations/{rec_id}", response_model=RecommendationResponse)
def update_recommendation_status(
    business_id: str,
    rec_id: str,
    req: RecommendationActionRequest,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    rec = (
        db.query(AIRecommendation)
        .filter(AIRecommendation.id == rec_id, AIRecommendation.business_id == business.id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found.")

    rec.status = req.status
    db.commit()
    db.refresh(rec)
    return rec

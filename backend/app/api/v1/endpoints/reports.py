from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.business import Business, Integration
from app.models.audit import WebsiteAudit
from app.models.competitor import Competitor
from app.models.review import Review
from app.models.recommendation import AIRecommendation
from app.models.automation import AutomationJob, ApprovalRequest
from app.schemas.report import DashboardSummaryResponse
from app.api.deps import verify_business_access
from app.services.scoring_engine import OpportunityScoringEngine

router = APIRouter()

@router.get("/{business_id}/dashboard-summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    business_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    """
    Returns an aggregated, real-time snapshot of business intelligence, KPIs,
    opportunity score factors, competitor benchmarks, sentiment breakdowns,
    and pending approval actions for the executive dashboard.
    """
    # 1. Latest audit
    latest_audit = (
        db.query(WebsiteAudit)
        .filter(WebsiteAudit.business_id == business.id)
        .order_by(WebsiteAudit.created_at.desc())
        .first()
    )
    website_health = latest_audit.overall_score if latest_audit else 0
    recent_issues = latest_audit.issues[:5] if latest_audit and latest_audit.issues else []

    # 2. Competitors
    competitors = (
        db.query(Competitor)
        .filter(Competitor.business_id == business.id)
        .order_by(Competitor.rating.desc(), Competitor.review_count.desc())
        .all()
    )
    total_competitors = len(competitors)
    avg_comp_rating = (
        round(sum(c.rating for c in competitors) / total_competitors, 1)
        if total_competitors > 0
        else 0.0
    )
    top_comp_name = competitors[0].name if competitors else "None"
    top_comp_rating = competitors[0].rating if competitors else 0.0

    # 3. Reviews & Sentiment
    reviews = db.query(Review).filter(Review.business_id == business.id).all()
    total_reviews = len(reviews)
    avg_rating = (
        round(sum(r.rating for r in reviews) / total_reviews, 1)
        if total_reviews > 0
        else 0.0
    )
    pos_count = sum(1 for r in reviews if r.sentiment == "positive")
    neu_count = sum(1 for r in reviews if r.sentiment == "neutral")
    neg_count = sum(1 for r in reviews if r.sentiment == "negative")
    pos_percent = round((pos_count / total_reviews) * 100, 1) if total_reviews > 0 else 0.0

    sentiment_breakdown = {
        "positive": pos_count,
        "neutral": neu_count,
        "negative": neg_count
    }

    # 4. Integrations
    gbp_integration = (
        db.query(Integration)
        .filter(Integration.business_id == business.id, Integration.provider == "google_gbp")
        .first()
    )
    is_gbp_connected = gbp_integration is not None and gbp_integration.status == "connected"

    # 5. Automations & Approvals
    active_automations = (
        db.query(AutomationJob)
        .filter(AutomationJob.business_id == business.id, AutomationJob.is_active == True)
        .count()
    )
    pending_approvals = (
        db.query(ApprovalRequest)
        .filter(ApprovalRequest.business_id == business.id, ApprovalRequest.status == "pending")
        .count()
    )

    # 6. Recommendations
    recs = (
        db.query(AIRecommendation)
        .filter(AIRecommendation.business_id == business.id, AIRecommendation.status == "active")
        .order_by(AIRecommendation.confidence.desc())
        .all()
    )
    active_recs_count = len(recs)
    top_recs = [
        {
            "id": r.id,
            "category": r.category,
            "title": r.title,
            "description": r.description,
            "priority": r.priority,
            "estimated_effort": r.estimated_effort,
            "suggested_action": r.suggested_action,
            "confidence": r.confidence
        }
        for r in recs[:4]
    ]

    # Recalculate opportunity score live
    current_dict = {
        "name": business.name,
        "category": business.category,
        "website_url": business.website_url,
        "phone": business.phone,
        "address": business.address,
        "services": business.services,
        "target_keywords": business.target_keywords
    }
    scoring = OpportunityScoringEngine.calculate_score(
        current_dict,
        latest_audit={"overall_score": website_health} if latest_audit else None,
        reviews_summary={
            "total_reviews": total_reviews,
            "average_rating": avg_rating,
            "positive_sentiment_percent": pos_percent
        },
        competitors_summary={
            "total_competitors": total_competitors,
            "average_rating": avg_comp_rating
        }
    )

    # Update business cache
    business.opportunity_score = scoring["total_score"]
    business.opportunity_factors = scoring
    db.commit()

    competitor_comparison = {
        "total_competitors": total_competitors,
        "market_average_rating": avg_comp_rating,
        "top_competitor_name": top_comp_name,
        "top_competitor_rating": top_comp_rating,
        "rating_gap": round(avg_rating - avg_comp_rating, 1) if total_reviews > 0 and total_competitors > 0 else 0.0
    }

    return DashboardSummaryResponse(
        business_id=business.id,
        business_name=business.name,
        opportunity_score=scoring["total_score"],
        opportunity_factors=scoring,
        website_health_score=website_health,
        total_competitors=total_competitors,
        average_rating=avg_rating,
        total_reviews=total_reviews,
        positive_sentiment_percent=pos_percent,
        google_gbp_connected=is_gbp_connected,
        active_automations_count=active_automations,
        pending_approvals_count=pending_approvals,
        active_recommendations_count=active_recs_count,
        top_recommendations=top_recs,
        recent_issues=recent_issues,
        sentiment_breakdown=sentiment_breakdown,
        competitor_comparison=competitor_comparison,
        last_updated=datetime.now(timezone.utc)
    )

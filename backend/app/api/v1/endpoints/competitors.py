from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.business import Business
from app.models.competitor import Competitor, CompetitorSnapshot
from app.schemas.competitor import (
    CompetitorResponse,
    CompetitorDiscoveryRequest,
    CompetitorBenchmarkResponse
)
from app.api.deps import verify_business_access
from app.services.places_service import GooglePlacesService
from app.services.scoring_engine import OpportunityScoringEngine

router = APIRouter()

@router.get("/{business_id}/competitors", response_model=CompetitorBenchmarkResponse)
def get_competitors(
    business_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    competitors = (
        db.query(Competitor)
        .filter(Competitor.business_id == business.id)
        .order_by(Competitor.rating.desc(), Competitor.review_count.desc())
        .all()
    )

    if not competitors:
        return CompetitorBenchmarkResponse(
            total_competitors=0,
            average_rating=0.0,
            average_reviews=0,
            top_competitors=[],
            market_saturation="low",
            opportunity_gap="No competitors tracked yet. Run a discovery scan to benchmark your local market.",
            competitors=[]
        )

    avg_rating = round(sum(c.rating for c in competitors) / len(competitors), 1)
    avg_reviews = int(sum(c.review_count for c in competitors) / len(competitors))
    saturation = "high" if len(competitors) >= 5 else ("moderate" if len(competitors) >= 2 else "low")
    
    gap_desc = (
        f"Local market has {len(competitors)} direct competitors averaging {avg_rating} stars and {avg_reviews} reviews. "
        "Differentiating through review responsiveness and technical SEO provides immediate local pack ranking advantage."
    )

    return CompetitorBenchmarkResponse(
        total_competitors=len(competitors),
        average_rating=avg_rating,
        average_reviews=avg_reviews,
        top_competitors=competitors[:3],
        market_saturation=saturation,
        opportunity_gap=gap_desc,
        competitors=competitors
    )

@router.post("/{business_id}/competitors/discover", response_model=CompetitorBenchmarkResponse)
async def discover_competitors(
    business_id: str,
    req: CompetitorDiscoveryRequest,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    category = req.category or business.category
    location_query = req.location_query or f"{business.city or ''} {business.state or ''}".strip() or business.address or "Downtown"

    discovered = await GooglePlacesService.discover_competitors(
        category=category,
        location_query=location_query,
        radius_meters=req.radius_meters
    )

    # Save to database
    saved_competitors = []
    for item in discovered:
        # Check if already tracked by place_id or name
        existing = (
            db.query(Competitor)
            .filter(
                Competitor.business_id == business.id,
                Competitor.name == item["name"]
            )
            .first()
        )
        if existing:
            existing.rating = item["rating"]
            existing.review_count = item["review_count"]
            existing.strengths = item.get("strengths", [])
            existing.weaknesses = item.get("weaknesses", [])
            saved_competitors.append(existing)
        else:
            comp = Competitor(
                business_id=business.id,
                name=item["name"],
                place_id=item.get("place_id"),
                category=item.get("category", category),
                address=item.get("address"),
                phone=item.get("phone"),
                website_url=item.get("website_url"),
                rating=item["rating"],
                review_count=item["review_count"],
                price_level=item.get("price_level"),
                distance_km=item.get("distance_km"),
                strengths=item.get("strengths", []),
                weaknesses=item.get("weaknesses", [])
            )
            db.add(comp)
            saved_competitors.append(comp)

    db.commit()

    # Recalculate business opportunity score with updated competitor data
    all_competitors = db.query(Competitor).filter(Competitor.business_id == business.id).all()
    comp_summary = {
        "total_competitors": len(all_competitors),
        "average_rating": sum(c.rating for c in all_competitors) / max(1, len(all_competitors))
    }
    scoring = OpportunityScoringEngine.calculate_score(
        business_dict={"name": business.name, "category": business.category, "website_url": business.website_url, "address": business.address, "phone": business.phone, "services": business.services, "target_keywords": business.target_keywords},
        competitors_summary=comp_summary
    )
    business.opportunity_score = scoring["total_score"]
    business.opportunity_factors = scoring
    db.commit()

    return get_competitors(business_id=business.id, db=db, business=business)

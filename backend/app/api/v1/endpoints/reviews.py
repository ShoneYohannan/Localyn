from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.business import Business
from app.models.review import Review
from app.schemas.review import (
    ReviewResponse,
    ReviewCreateRequest,
    GenerateResponseRequest,
    ResponseDraftResponse,
    ReviewSentimentSummary
)
from app.api.deps import verify_business_access
from app.services.sentiment_service import SentimentAnalysisService
from app.services.ai_orchestrator import AIOrchestratorService
from app.services.scoring_engine import OpportunityScoringEngine

router = APIRouter()

@router.get("/{business_id}/reviews", response_model=ReviewSentimentSummary)
def get_reviews(
    business_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    reviews = (
        db.query(Review)
        .filter(Review.business_id == business.id)
        .order_by(Review.review_date.desc())
        .all()
    )

    if not reviews:
        return ReviewSentimentSummary(
            total_reviews=0,
            average_rating=0.0,
            positive_count=0,
            neutral_count=0,
            negative_count=0,
            escalated_count=0,
            common_topics=[],
            recent_reviews=[]
        )

    pos = sum(1 for r in reviews if r.sentiment == "positive")
    neu = sum(1 for r in reviews if r.sentiment == "neutral")
    neg = sum(1 for r in reviews if r.sentiment == "negative")
    esc = sum(1 for r in reviews if r.is_escalated)
    avg_r = round(sum(r.rating for r in reviews) / len(reviews), 1)

    all_topics = []
    for r in reviews:
        if r.topics:
            all_topics.extend(r.topics)
    topic_counts = {}
    for t in all_topics:
        topic_counts[t] = topic_counts.get(t, 0) + 1
    top_topics = sorted(topic_counts.keys(), key=lambda x: topic_counts[x], reverse=True)[:5]

    return ReviewSentimentSummary(
        total_reviews=len(reviews),
        average_rating=avg_r,
        positive_count=pos,
        neutral_count=neu,
        negative_count=neg,
        escalated_count=esc,
        common_topics=top_topics,
        recent_reviews=reviews
    )

@router.post("/{business_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    business_id: str,
    req: ReviewCreateRequest,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    # Analyze sentiment
    nlp = SentimentAnalysisService.analyze_review(req.text, req.rating)

    review = Review(
        business_id=business.id,
        author_name=req.author_name,
        rating=req.rating,
        text=req.text,
        source=req.source,
        sentiment=nlp["sentiment"],
        sentiment_score=nlp["sentiment_score"],
        topics=nlp["topics"],
        is_escalated=nlp["is_escalated"],
        review_date=req.review_date or datetime.now(timezone.utc)
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate business opportunity score
    all_reviews = db.query(Review).filter(Review.business_id == business.id).all()
    pos = sum(1 for r in all_reviews if r.sentiment == "positive")
    rev_summary = {
        "total_reviews": len(all_reviews),
        "average_rating": sum(r.rating for r in all_reviews) / max(1, len(all_reviews)),
        "positive_sentiment_percent": (pos / max(1, len(all_reviews))) * 100
    }
    scoring = OpportunityScoringEngine.calculate_score(
        business_dict={"name": business.name, "category": business.category, "website_url": business.website_url, "address": business.address, "phone": business.phone, "services": business.services, "target_keywords": business.target_keywords},
        reviews_summary=rev_summary
    )
    business.opportunity_score = scoring["total_score"]
    business.opportunity_factors = scoring
    db.commit()

    return review

@router.post("/{business_id}/reviews/{review_id}/generate-response", response_model=ResponseDraftResponse)
async def generate_response(
    business_id: str,
    review_id: str,
    req: GenerateResponseRequest,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    review = (
        db.query(Review)
        .filter(Review.id == review_id, Review.business_id == business.id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found.")

    draft = await AIOrchestratorService.generate_review_response(
        business_name=business.name,
        reviewer_name=review.author_name,
        rating=review.rating,
        review_text=review.text or "",
        tone=req.tone,
        custom_instructions=req.custom_instructions
    )

    review.response_text = draft
    review.response_status = "drafted"
    db.commit()

    return ResponseDraftResponse(
        review_id=review.id,
        suggested_reply=draft,
        sentiment=review.sentiment,
        tone=req.tone
    )

@router.post("/{business_id}/reviews/{review_id}/publish-response", response_model=ReviewResponse)
def publish_response(
    business_id: str,
    review_id: str,
    db: Session = Depends(get_db),
    business: Business = Depends(verify_business_access)
):
    review = (
        db.query(Review)
        .filter(Review.id == review_id, Review.business_id == business.id)
        .first()
    )
    if not review or not review.response_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot publish: review not found or response text is empty."
        )

    review.response_status = "published"
    review.published_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(review)
    return review

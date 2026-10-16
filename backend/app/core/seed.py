from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.user import User, Organization, OrganizationMember
from app.models.business import Business, BusinessLocation, Integration
from app.models.competitor import Competitor
from app.models.audit import WebsiteAudit
from app.models.review import Review
from app.models.recommendation import AIRecommendation
from app.models.automation import AutomationJob, AutomationExecution, ApprovalRequest
from app.models.notification import Notification
from app.core.security import hash_password
from app.services.scoring_engine import OpportunityScoringEngine
from app.services.automation_service import AutomationService

def seed_initial_demo_data(db: Session) -> None:
    """
    Seeds a rich initial demo tenant with realistic business data, competitors,
    reviews, audit metrics, recommendations, and approval workflows if DB is empty.
    """
    # Check if demo user already exists
    existing_user = db.query(User).filter(User.email == "demo@localyn.ai").first()
    if existing_user:
        return

    now = datetime.now(timezone.utc)

    # 1. Organization & User
    org = Organization(
        name="Apex Marketing & Growth",
        slug="apex-marketing",
        plan_tier="agency_pro"
    )
    db.add(org)
    db.flush()

    user = User(
        email="demo@localyn.ai",
        hashed_password=hash_password("LocalynPass123!"),
        full_name="Alex Rivera",
        role="owner",
        is_active=True
    )
    db.add(user)
    db.flush()

    membership = OrganizationMember(
        organization_id=org.id,
        user_id=user.id,
        role="owner"
    )
    db.add(membership)

    # 2. Showcase Business: "Apex Dental Studio"
    business = Business(
        organization_id=org.id,
        name="Apex Dental Studio",
        category="Dentist & Cosmetic Dental",
        website_url="https://example.com/apex-dental",
        phone="(312) 555-0198",
        address="742 North Michigan Avenue, Suite 400",
        city="Chicago",
        state="IL",
        postal_code="60611",
        country="US",
        target_keywords=["cosmetic dentist chicago", "teeth whitening downtown", "invisalign provider", "emergency dental loop"],
        target_audience=["Local residents", "Downtown professionals", "Family care seekers"],
        services=["Cosmetic Dentistry", "Teeth Whitening", "Invisalign", "Dental Implants", "Preventive Hygiene"],
        opportunity_score=78,
        opportunity_factors={}
    )
    db.add(business)
    db.flush()

    # Primary Location
    loc = BusinessLocation(
        business_id=business.id,
        name="Apex Dental Studio — Downtown Flagship",
        address="742 North Michigan Avenue, Suite 400, Chicago IL 60611",
        latitude=41.8955,
        longitude=-87.6244,
        phone="(312) 555-0198",
        place_id="ChIJ-w1hY-ctDogR4gJ6X991",
        is_primary=1
    )
    db.add(loc)

    # Google GBP Connected Integration
    integration = Integration(
        business_id=business.id,
        provider="google_gbp",
        status="connected",
        account_id="acc_apex_chicago_01",
        account_name="Apex Dental Studio (Verified Google Business Profile)",
        last_synced_at=now - timedelta(hours=2),
        settings={"locations_count": 1, "auto_sync_reviews": True, "verification_status": "verified"}
    )
    db.add(integration)

    # 3. Baseline Website Technical Audit
    audit = WebsiteAudit(
        business_id=business.id,
        audited_url="https://example.com/apex-dental",
        overall_score=82,
        seo_score=85,
        performance_score=76,
        security_score=95,
        mobile_score=84,
        response_time_ms=342,
        status="completed",
        summary="Solid technical SEO foundation with quick server response. Identified missing LocalBusiness schema and uncompressed hero images affecting Mobile LCP.",
        issues=[
            {
                "id": "schema-missing",
                "severity": "high",
                "category": "seo",
                "title": "Missing Schema.org LocalBusiness structured data",
                "description": "Rich snippets and local map knowledge cards require JSON-LD Dentist schema markup.",
                "remediation": "Inject LocalBusiness/Dentist structured JSON-LD with geo-coordinates, telephone, and operating hours."
            },
            {
                "id": "image-optimization",
                "severity": "medium",
                "category": "performance",
                "title": "Unoptimized hero banner image (2.4 MB)",
                "description": "Desktop hero graphic is served in PNG format without Next-gen WebP/AVIF compression.",
                "remediation": "Convert to WebP format and specify width/height attributes to eliminate layout shifts."
            },
            {
                "id": "meta-description-length",
                "severity": "low",
                "category": "seo",
                "title": "Meta description exceeds 160 characters",
                "description": "Current snippet is 184 characters and may truncate in Google mobile SERP displays.",
                "remediation": "Shorten description to 150 characters highlighting key USP and phone number callout."
            }
        ],
        meta_tags={
            "title": "Apex Dental Studio | Top Rated Cosmetic Dentist Chicago",
            "description": "Award-winning cosmetic dentistry, teeth whitening, and Invisalign in downtown Chicago. Convenient Saturday hours and modern painless care.",
            "viewport": "width=device-width, initial-scale=1"
        },
        headings={"h1": ["Downtown Chicago's Premier Cosmetic Dental Practice"], "h2_count": 6, "h3_count": 12},
        broken_links=[],
        schema_markup={"found": False, "types": []}
    )
    db.add(audit)

    # 4. Local Competitors
    competitors_data = [
        {
            "name": "Magnificent Mile Dental Group",
            "category": "Dentist",
            "address": "676 N Michigan Ave #3900, Chicago, IL 60611",
            "rating": 4.9,
            "review_count": 312,
            "distance_km": 0.2,
            "strengths": ["High review count", "Over 10 years in business", "Active GBP posts"],
            "weaknesses": ["Slow website load time (3.1s)", "No online scheduling widget"]
        },
        {
            "name": "Water Tower Dental Care",
            "category": "Cosmetic Dentist",
            "address": "845 N Michigan Ave #951W, Chicago, IL 60611",
            "rating": 4.8,
            "review_count": 245,
            "distance_km": 0.4,
            "strengths": ["Strong Invisalign branding", "Video patient testimonials"],
            "weaknesses": ["Low review response rate (under 30%)", "Sparse service page schema"]
        },
        {
            "name": "Lakeshore Modern Dentistry",
            "category": "Dental Clinic",
            "address": "500 E Grand Ave, Chicago, IL 60611",
            "rating": 4.5,
            "review_count": 98,
            "distance_km": 0.9,
            "strengths": ["Evening walk-in hours"],
            "weaknesses": ["Negative review sentiment regarding billing wait times", "Outdated mobile UX"]
        }
    ]
    for c_data in competitors_data:
        comp = Competitor(
            business_id=business.id,
            name=c_data["name"],
            category=c_data["category"],
            address=c_data["address"],
            rating=c_data["rating"],
            review_count=c_data["review_count"],
            distance_km=c_data["distance_km"],
            strengths=c_data["strengths"],
            weaknesses=c_data["weaknesses"]
        )
        db.add(comp)

    # 5. Reviews
    sample_reviews = [
        {
            "author": "Marcus Sterling",
            "rating": 5.0,
            "text": "Dr. Rivera and the team at Apex are exceptional. Got my teeth whitening and two crowns done—painless, modern tech, and ultra friendly staff. Highly recommend!",
            "sentiment": "positive",
            "score": 0.95,
            "topics": ["staff", "service", "quality"],
            "status": "responded",
            "response": "Thank you so much Marcus! It was our pleasure taking care of your smile. Looking forward to seeing you at your next regular checkup!",
            "days_ago": 3
        },
        {
            "author": "Elena Rostova",
            "rating": 5.0,
            "text": "Best dental practice in the Loop! The Michigan Ave office is pristine with great views. The hygienist was so thorough and gentle.",
            "sentiment": "positive",
            "score": 0.91,
            "topics": ["ambiance", "cleanliness", "staff"],
            "status": "responded",
            "response": "We appreciate the glowing review Elena! Our team is dedicated to creating a comfortable and calm environment for every patient.",
            "days_ago": 7
        },
        {
            "author": "Jordan Hayes",
            "rating": 4.0,
            "text": "High quality dental work and friendly reception. Only slight downside was having to wait 20 minutes past my appointment time before being called back.",
            "sentiment": "neutral",
            "score": 0.45,
            "topics": ["wait_time", "reception"],
            "status": "drafted",
            "response": None,
            "days_ago": 12
        },
        {
            "author": "David Miller",
            "rating": 2.0,
            "text": "Dental care was fine, but billing was confusing with my out-of-network insurance claim. Needed multiple calls with the front desk to resolve.",
            "sentiment": "negative",
            "score": -0.72,
            "topics": ["billing", "insurance", "wait_time"],
            "status": "needs_response",
            "response": None,
            "days_ago": 15
        }
    ]
    for r in sample_reviews:
        rev = Review(
            business_id=business.id,
            author_name=r["author"],
            rating=r["rating"],
            text=r["text"],
            source="google",
            sentiment=r["sentiment"],
            sentiment_score=r["score"],
            topics=r["topics"],
            is_escalated=(r["rating"] <= 2),
            response_status=r["status"],
            response_text=r["response"],
            published_at=now - timedelta(days=r["days_ago"] - 1) if r["response"] else None,
            review_date=now - timedelta(days=r["days_ago"])
        )
        db.add(rev)

    # 6. AI Recommendations
    recs_data = [
        {
            "category": "reviews",
            "title": "Address insurance billing feedback and reduce negative sentiment",
            "description": "Patient review from David Miller flagged confusion regarding out-of-network claim processing. Providing a clear insurance FAQ on your website and responding empathetically can recover patient retention.",
            "priority": "high",
            "effort": "low",
            "action": "Use AI Review Responder to craft an empathetic resolution reply directing them to the billing manager."
        },
        {
            "category": "seo",
            "title": "Implement LocalBusiness JSON-LD schema markup",
            "description": "Competitor 'Magnificent Mile Dental' ranks in the top 3 pack because their Google Knowledge graph connects structured opening hours and accepted insurances.",
            "priority": "high",
            "effort": "medium",
            "action": "Generate and embed automated Schema.org Dentist snippet into your website header."
        },
        {
            "category": "gbp",
            "title": "Publish bi-weekly Google Business Profile update showcasing Spring Whitening",
            "description": "Active GBP listings with weekly photo and promotional updates receive 42% more direct direction requests and website clicks.",
            "priority": "medium",
            "effort": "low",
            "action": "Schedule seasonal promotional post to Google Business Profile via automated approval queue."
        }
    ]
    for r_item in recs_data:
        rec = AIRecommendation(
            business_id=business.id,
            category=r_item["category"],
            title=r_item["title"],
            description=r_item["description"],
            priority=r_item["priority"],
            estimated_effort=r_item["effort"],
            suggested_action=r_item["action"],
            confidence=0.92,
            status="active"
        )
        db.add(rec)

    # 7. Automation Jobs & Pending Approval Request
    jobs = AutomationService.initialize_default_jobs(db, business.id)
    
    # Create an approval request for the GBP post schedule job
    gbp_job = next((j for j in jobs if j.job_type == "gbp_post_schedule"), None)
    if gbp_job:
        execution = AutomationExecution(
            job_id=gbp_job.id,
            business_id=business.id,
            status="awaiting_approval",
            idempotency_key=f"demo-exec-{int(now.timestamp())}",
            logs="AI generated seasonal post: 'Spring Smile Makeover Special — 20% Off Teeth Whitening'. Awaiting human approval before publishing.",
            result={"post_title": "Spring Smile Makeover Special", "discount_code": "SPRING20"},
            started_at=now - timedelta(minutes=45)
        )
        db.add(execution)
        db.flush()

        approval = ApprovalRequest(
            execution_id=execution.id,
            business_id=business.id,
            action_type="gbp_post_schedule",
            title="Approve GBP Promotional Post: 'Spring Smile Makeover'",
            description="The automated marketing engine prepared a seasonal Google Business Profile promotional post offering 20% off professional whitening throughout April. Approve to publish to live profile.",
            payload={
                "post_type": "offer",
                "headline": "Spring Into A Brighter Smile with 20% Off Whitening",
                "call_to_action": "BOOK_ONLINE",
                "target_url": "https://example.com/apex-dental/spring-special"
            },
            status="pending"
        )
        db.add(approval)

    # 8. Notifications
    notifs = [
        Notification(
            organization_id=org.id,
            title="New Google Review Received",
            message="Marcus Sterling left a 5-star review for Apex Dental Studio.",
            notification_type="review_alert",
            is_read=True
        ),
        Notification(
            organization_id=org.id,
            title="Action Required: Approval Needed",
            message="A new Google Business Profile promotional post is awaiting your approval before publishing.",
            notification_type="approval_required",
            is_read=False,
            link="/automations"
        )
    ]
    for n in notifs:
        db.add(n)

    # Recalculate baseline opportunity score
    scoring = OpportunityScoringEngine.calculate_score(
        {
            "name": business.name,
            "category": business.category,
            "website_url": business.website_url,
            "phone": business.phone,
            "address": business.address,
            "services": business.services,
            "target_keywords": business.target_keywords
        },
        latest_audit={"overall_score": audit.overall_score},
        reviews_summary={
            "total_reviews": 4,
            "average_rating": 4.0,
            "positive_sentiment_percent": 50.0
        },
        competitors_summary={
            "total_competitors": 3,
            "average_rating": 4.7
        }
    )
    business.opportunity_score = scoring["total_score"]
    business.opportunity_factors = scoring

    db.commit()

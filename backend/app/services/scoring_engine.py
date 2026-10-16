from typing import Dict, Any, List

class OpportunityScoringEngine:
    """
    Transparent, explainable rule-based opportunity scoring engine (0-100).
    Evaluates:
      - Website Technical Health (weight: 25%)
      - Business Profile Completeness (weight: 20%)
      - Review Volume & Sentiment (weight: 25%)
      - Competitor Market Gap (weight: 20%)
      - Search & Keyword Readiness (weight: 10%)
    """

    @classmethod
    def calculate_score(
        cls,
        business_dict: Dict[str, Any],
        latest_audit: Dict[str, Any] | None = None,
        reviews_summary: Dict[str, Any] | None = None,
        competitors_summary: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        breakdown = {}
        
        # 1. Profile Completeness (20 points max)
        profile_pts = 0
        if business_dict.get("name"): profile_pts += 3
        if business_dict.get("category"): profile_pts += 3
        if business_dict.get("website_url"): profile_pts += 4
        if business_dict.get("phone"): profile_pts += 3
        if business_dict.get("address"): profile_pts += 3
        if business_dict.get("services") and len(business_dict["services"]) > 0: profile_pts += 4
        breakdown["profile_completeness"] = {
            "score": min(20, profile_pts),
            "max": 20,
            "weight_pct": 20,
            "status": "Optimal" if profile_pts >= 18 else "Needs Information"
        }

        # 2. Website Technical Health (25 points max)
        website_pts = 0
        if latest_audit:
            audit_overall = latest_audit.get("overall_score", 0)
            website_pts = round((audit_overall / 100.0) * 25)
        elif business_dict.get("website_url"):
            website_pts = 12  # Website exists but not yet audited
        else:
            website_pts = 0   # No website provided
        breakdown["website_health"] = {
            "score": min(25, website_pts),
            "max": 25,
            "weight_pct": 25,
            "status": "Audited" if latest_audit else ("Pending Audit" if business_dict.get("website_url") else "Missing Website")
        }

        # 3. Review Volume & Sentiment (25 points max)
        review_pts = 0
        if reviews_summary and reviews_summary.get("total_reviews", 0) > 0:
            total = reviews_summary.get("total_reviews", 0)
            avg_rating = reviews_summary.get("average_rating", 0.0)
            pos_pct = reviews_summary.get("positive_sentiment_percent", 50.0)
            
            # Review volume component (up to 10 pts)
            if total >= 50: review_pts += 10
            elif total >= 20: review_pts += 7
            elif total >= 5: review_pts += 4
            else: review_pts += 2
            
            # Average rating component (up to 10 pts)
            if avg_rating >= 4.5: review_pts += 10
            elif avg_rating >= 4.0: review_pts += 7
            elif avg_rating >= 3.0: review_pts += 4
            else: review_pts += 1
            
            # Sentiment component (up to 5 pts)
            if pos_pct >= 80: review_pts += 5
            elif pos_pct >= 60: review_pts += 3
            else: review_pts += 1
        else:
            review_pts = 8  # Baseline
        breakdown["reputation_and_reviews"] = {
            "score": min(25, review_pts),
            "max": 25,
            "weight_pct": 25,
            "status": "Monitored" if reviews_summary and reviews_summary.get("total_reviews", 0) > 0 else "Baseline"
        }

        # 4. Competitor Market Gap (20 points max)
        competitor_pts = 0
        if competitors_summary and competitors_summary.get("total_competitors", 0) > 0:
            total_comp = competitors_summary.get("total_competitors", 0)
            # Having competitive benchmark data and opportunity to outrank
            if total_comp >= 5: competitor_pts = 18
            elif total_comp >= 1: competitor_pts = 14
        else:
            competitor_pts = 10  # Discovery pending
        breakdown["competitor_intelligence"] = {
            "score": min(20, competitor_pts),
            "max": 20,
            "weight_pct": 20,
            "status": "Benchmarked" if competitors_summary and competitors_summary.get("total_competitors", 0) > 0 else "Pending Scan"
        }

        # 5. Search & Keyword Readiness (10 points max)
        keyword_pts = 0
        keywords = business_dict.get("target_keywords", [])
        if len(keywords) >= 5: keyword_pts = 10
        elif len(keywords) >= 1: keyword_pts = 6
        else: keyword_pts = 2
        breakdown["search_readiness"] = {
            "score": min(10, keyword_pts),
            "max": 10,
            "weight_pct": 10,
            "status": f"{len(keywords)} Keywords Targeted"
        }

        total_score = sum(item["score"] for item in breakdown.values())
        total_score = max(5, min(100, total_score))

        return {
            "total_score": total_score,
            "grade": "A" if total_score >= 85 else ("B" if total_score >= 70 else ("C" if total_score >= 50 else "D")),
            "breakdown": breakdown,
            "recommendation_summary": cls._generate_summary(total_score, breakdown)
        }

    @staticmethod
    def _generate_summary(score: int, breakdown: Dict[str, Any]) -> str:
        if score >= 80:
            return "Strong digital foundation. Focus on proactive GBP posting and targeted review generation."
        elif score >= 60:
            return "Good baseline presence with clear expansion opportunities in technical SEO and competitor differentiation."
        else:
            return "High growth potential. Completing business profile details and running a technical website audit will yield immediate visibility gains."

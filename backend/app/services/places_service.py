import logging
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class GooglePlacesService:
    """
    Adapter client for discovering and benchmarking local competitors.
    Uses Google Places TextSearch / NearbySearch API when configured.
    Falls back gracefully to high-fidelity demo data when API keys are not supplied.
    """

    @classmethod
    async def discover_competitors(
        cls,
        category: str,
        location_query: str,
        radius_meters: int = 5000
    ) -> List[Dict[str, Any]]:
        api_key = settings.GOOGLE_PLACES_API_KEY.strip()
        
        if api_key:
            try:
                return await cls._fetch_google_places_api(api_key, category, location_query, radius_meters)
            except Exception as e:
                logger.error(f"Google Places API request failed: {e}. Falling back to demo mode.")
                return cls._generate_mock_competitors(category, location_query, simulated_reason=str(e))
        else:
            return cls._generate_mock_competitors(category, location_query)

    @classmethod
    async def _fetch_google_places_api(
        cls,
        api_key: str,
        category: str,
        location_query: str,
        radius_meters: int
    ) -> List[Dict[str, Any]]:
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        query = f"{category} in {location_query}"
        params = {
            "query": query,
            "radius": radius_meters,
            "key": api_key
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params)
            data = resp.json()
            
            if data.get("status") not in ("OK", "ZERO_RESULTS"):
                raise ValueError(f"Google Places Error: {data.get('status')} - {data.get('error_message')}")
            
            results = data.get("results", [])
            competitors = []
            for item in results[:10]:
                rating = float(item.get("rating", 0.0))
                user_ratings_total = int(item.get("user_ratings_total", 0))
                
                # Derive realistic strengths and gaps from ratings
                strengths = []
                weaknesses = []
                if rating >= 4.5:
                    strengths.append("High customer review satisfaction")
                if user_ratings_total > 50:
                    strengths.append("Strong local review volume")
                if rating < 4.0:
                    weaknesses.append("Lower average rating (< 4.0)")
                if user_ratings_total < 20:
                    weaknesses.append("Low review velocity")

                competitors.append({
                    "name": item.get("name"),
                    "place_id": item.get("place_id"),
                    "category": category,
                    "address": item.get("formatted_address"),
                    "rating": rating,
                    "review_count": user_ratings_total,
                    "price_level": item.get("price_level"),
                    "website_url": None,
                    "distance_km": 1.2,
                    "strengths": strengths or ["Established local presence"],
                    "weaknesses": weaknesses or ["Inconsistent review response rate"],
                    "data_source": "google_places_api"
                })
            return competitors

    @classmethod
    def _generate_mock_competitors(
        cls,
        category: str,
        location_query: str,
        simulated_reason: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Provides realistic local competitor fixtures with transparent metadata.
        """
        loc = location_query or "Downtown"
        cat = category or "Local Business"
        
        sample_names = [
            f"Apex {cat} & Co.",
            f"Metro {cat} Group",
            f"Precision {cat} Studio",
            f"{loc} Premier {cat}",
            f"Vanguard {cat} Solutions"
        ]

        fixtures = [
            {
                "name": sample_names[0],
                "place_id": "mock_place_001",
                "category": cat,
                "address": f"104 Market St, {loc}",
                "phone": "(555) 234-5678",
                "website_url": f"https://apex-{cat.lower().replace(' ', '')}-demo.com",
                "rating": 4.8,
                "review_count": 142,
                "price_level": 2,
                "distance_km": 0.8,
                "strengths": ["Active Google Business Profile posting", "High review count (140+)", "Fast review response time"],
                "weaknesses": ["Slow mobile website load speed", "Missing service landing pages"],
                "data_source": "mock_demo_mode"
            },
            {
                "name": sample_names[1],
                "place_id": "mock_place_002",
                "category": cat,
                "address": f"550 Grand Ave, {loc}",
                "phone": "(555) 345-6789",
                "website_url": f"https://metro-{cat.lower().replace(' ', '')}-demo.com",
                "rating": 4.3,
                "review_count": 68,
                "price_level": 3,
                "distance_km": 1.5,
                "strengths": ["Modern responsive website", "Strong LocalBusiness schema markup"],
                "weaknesses": ["Low review velocity in the past 60 days", "Unanswered negative reviews"],
                "data_source": "mock_demo_mode"
            },
            {
                "name": sample_names[2],
                "place_id": "mock_place_003",
                "category": cat,
                "address": f"88 Pine Blvd, {loc}",
                "phone": "(555) 456-7890",
                "website_url": f"https://precision-{cat.lower().replace(' ', '')}-demo.com",
                "rating": 3.9,
                "review_count": 31,
                "price_level": 1,
                "distance_km": 2.1,
                "strengths": ["Competitive entry-level pricing", "Prominent location"],
                "weaknesses": ["Low average rating (3.9)", "Incomplete GBP business hours and services"],
                "data_source": "mock_demo_mode"
            },
            {
                "name": sample_names[3],
                "place_id": "mock_place_004",
                "category": cat,
                "address": f"322 Oak Way, {loc}",
                "phone": "(555) 567-8901",
                "website_url": None,
                "rating": 4.6,
                "review_count": 89,
                "price_level": 2,
                "distance_km": 2.7,
                "strengths": ["Strong word-of-mouth reputation", "Consistent 5-star mentions"],
                "weaknesses": ["No dedicated business website (GBP only)", "Missing targeted keyword metadata"],
                "data_source": "mock_demo_mode"
            }
        ]
        return fixtures

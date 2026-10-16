from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    businesses,
    audits,
    competitors,
    reviews,
    recommendations,
    automations,
    reports,
    integrations,
    notifications,
)

api_router = APIRouter()

# Authentication & Tenancy
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Businesses & Core Intelligence
api_router.include_router(businesses.router, prefix="/businesses", tags=["Businesses"])
api_router.include_router(audits.router, prefix="/businesses", tags=["Website SEO Audits"])
api_router.include_router(competitors.router, prefix="/businesses", tags=["Competitor Intelligence"])
api_router.include_router(reviews.router, prefix="/businesses", tags=["Reviews & Sentiment"])
api_router.include_router(recommendations.router, prefix="/businesses", tags=["AI Recommendations"])
api_router.include_router(automations.router, prefix="/businesses", tags=["Automations & Approvals"])
api_router.include_router(reports.router, prefix="/businesses", tags=["Reports & Dashboard"])

# External Integrations
api_router.include_router(integrations.router, prefix="/integrations", tags=["Google Integrations"])

# System Notifications
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

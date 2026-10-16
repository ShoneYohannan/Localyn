import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.api.v1.api import api_router
from app.core.seed import seed_initial_demo_data

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("localyn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables are created and seed data is present
    logger.info("Initializing Localyn database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Run seed in Session context
    db = next(get_db())
    try:
        logger.info("Verifying demo tenant seed data...")
        seed_initial_demo_data(db)
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()
        
    yield
    
    # Shutdown
    logger.info("Localyn API shutting down gracefully.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Localyn is an AI-powered local business intelligence, competitor benchmarking, SEO auditing, review sentiment analysis, and workflow automation platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
origins = list(settings.BACKEND_CORS_ORIGINS) if hasattr(settings, "BACKEND_CORS_ORIGINS") else []
if "*" not in origins:
    origins.extend(["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def root():
    return {
        "platform": "Localyn AI Local Business Growth Platform",
        "version": "1.0.0",
        "status": "operational",
        "docs_url": "/docs",
        "api_v1_prefix": settings.API_V1_STR,
        "environment": settings.ENVIRONMENT
    }

@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    try:
        # Check DB connectivity
        db.execute(Base.metadata.tables["businesses"].select().limit(1))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "services": {
            "places_adapter": "ready (mock/real)",
            "gbp_adapter": "ready (mock/real)",
            "gemini_orchestrator": "ready (heuristic/gemini)",
            "ssrf_safe_auditor": "ready"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

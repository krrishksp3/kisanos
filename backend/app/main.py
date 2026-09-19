import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import Base, engine, check_db_health, IS_POSTGRES
from app.routers import (
    auth,
    farms,
    observations,
    advisor,
    stores,
    markets,
    harvest,
    weather,
    notifications
)

logger = logging.getLogger("kisanos.main")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing KisanOS AI application...")
    Base.metadata.create_all(bind=engine)
    health = check_db_health()
    logger.info(f"Database status: {health['status']} | Dialect: {health['dialect']} | PostgreSQL: {health['is_postgres']}")
    yield
    # Shutdown
    logger.info("KisanOS AI shutting down...")


tags_metadata = [
    {"name": "Authentication", "description": "Farmer registration, JWT login, and profile access."},
    {"name": "Farms", "description": "Farm registration, GPS boundaries, soil characteristics, and crop telemetry."},
    {"name": "Farm History", "description": "Farm Memory: Multi-season crop yields, inputs, and sales benchmarks."},
    {"name": "Crop Monitoring", "description": "Symptom logs, camera diagnosis, and severity tracking."},
    {"name": "AI Advisor", "description": "Multi-modal RAG agricultural advisor with farm context fusion."},
    {"name": "Stores", "description": "Agri-input retail discovery, stock availability, and distance routing."},
    {"name": "Markets", "description": "Regional Mandi benchmark rates and verified buyer listings."},
    {"name": "Harvest", "description": "Digital harvest lot creation, grading, and sales status."},
    {"name": "Weather", "description": "Localized 5-day weather forecasts and irrigation advisories."},
    {"name": "Notifications", "description": "Proactive alerts for weather risks, pest threats, and Mandi price updates."},
]

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    description="**'From Soil to Sale'** — Complete Backend Engine for Indian Agriculture.",
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for Next.js frontend
allowed_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "सर्वर में आंतरिक त्रुटि उत्पन्न हुई। कृपया पुनः प्रयास करें। (Internal Server Error)",
            "path": request.url.path
        }
    )


# Include Routers with /api prefix
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(farms.router, prefix=api_prefix)
app.include_router(observations.router, prefix=api_prefix)
app.include_router(advisor.router, prefix=api_prefix)
app.include_router(stores.router, prefix=api_prefix)
app.include_router(markets.router, prefix=api_prefix)
app.include_router(harvest.router, prefix=api_prefix)
app.include_router(weather.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)


@app.get("/", tags=["System"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "tagline": "From Soil to Sale — One Farmer. One Farm. One Connected Platform.",
        "docs_url": "/docs"
    }


@app.get("/health", tags=["System"])
def health():
    """Minimal deployment health probe."""
    return {"status": "ok"}


@app.get("/api/health", tags=["System"])
def health_check():
    """System and database connectivity health probe."""
    db_health = check_db_health()
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "database": db_health
    }

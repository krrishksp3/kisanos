import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    # Application
    APP_NAME: str = "KisanOS AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api"

    # Security
    SECRET_KEY: str = "kisanos-super-secret-key-change-in-production-min-32-chars-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # PostgreSQL Production DB Config
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "kisanos"
    DATABASE_URL: Optional[str] = "postgresql+psycopg://postgres:postgres@localhost:5432/kisanos"

    # SQLite Dev/Demo Fallback (strictly for local dev without postgres)
    ALLOW_SQLITE_FALLBACK: bool = True
    SQLITE_DB_PATH: str = "kisanos_dev.db"

    # Configurable Demo Seed Values (Not hard-coded into app logic)
    DEMO_FARMER_NAME: str = "Ramesh Patel (रामेश पटेल)"
    DEMO_FARMER_PHONE: str = "9876543210"
    DEMO_FARMER_PASSWORD: str = "Password123!"
    DEMO_FARMER_LANGUAGE: str = "hi"
    DEMO_FARMER_LOCATION: str = "Sehore, Madhya Pradesh (सीहोर, मध्य प्रदेश)"

    DEMO_FARM_NAME: str = "North Field A (उत्तर खेत A)"
    DEMO_FARM_LOCATION: str = "Sehore District, Madhya Pradesh"
    DEMO_FARM_LAT: float = 23.2033
    DEMO_FARM_LON: float = 77.0844
    DEMO_FARM_AREA_ACRES: float = 2.5
    DEMO_SOIL_TYPE: str = "Black loamy soil (काली दोमट मिट्टी)"
    DEMO_SOIL_PH: float = 6.8
    DEMO_IRRIGATION_TYPE: str = "Tubewell + Drip (नलकूप + ड्रिप सिंचाई)"
    DEMO_CURRENT_CROP: str = "Wheat (गेहूं - Sharbati)"
    DEMO_CURRENT_STAGE: str = "Tillering (कल्ले फूटने की अवस्था)"

    # AI & External Provider Configuration
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    AI_PROVIDER: str = "fallback"  # gemini, openai, fallback
    LLM_PROVIDER: Optional[str] = None  # gemini, openai, fallback/none
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gemini-1.5-flash"
    WEATHER_API_KEY: Optional[str] = None
    MANDI_API_KEY: Optional[str] = None
    STORAGE_PROVIDER: str = "local"
    STORAGE_DIR: str = "./uploads"



settings = Settings()

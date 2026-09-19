"""
Configurable Seed Parameters for KisanOS AI.
Allows changing the demo farmer, region, coordinates, farm characteristics, and crop varieties
without modifying code or hardcoding data.
"""
from pydantic import BaseModel
from app.core.config import settings


class SeedConfig(BaseModel):
    # Farmer Profile
    farmer_name: str = settings.DEMO_FARMER_NAME
    farmer_phone: str = settings.DEMO_FARMER_PHONE
    farmer_password: str = settings.DEMO_FARMER_PASSWORD
    farmer_language: str = settings.DEMO_FARMER_LANGUAGE
    farmer_location: str = settings.DEMO_FARMER_LOCATION

    # Primary Farm Profile
    farm_name: str = settings.DEMO_FARM_NAME
    farm_location: str = settings.DEMO_FARM_LOCATION
    farm_latitude: float = settings.DEMO_FARM_LAT
    farm_longitude: float = settings.DEMO_FARM_LON
    farm_area_acres: float = settings.DEMO_FARM_AREA_ACRES
    farm_soil_type: str = settings.DEMO_SOIL_TYPE
    farm_soil_ph: float = settings.DEMO_SOIL_PH
    farm_irrigation_type: str = settings.DEMO_IRRIGATION_TYPE
    farm_current_crop: str = settings.DEMO_CURRENT_CROP
    farm_current_stage: str = settings.DEMO_CURRENT_STAGE


def get_seed_config() -> SeedConfig:
    return SeedConfig()

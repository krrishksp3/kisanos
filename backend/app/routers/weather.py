from fastapi import APIRouter, Query
from app.schemas.weather import WeatherResponse
from app.services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("", response_model=WeatherResponse)
def get_weather(
    latitude: float = Query(default=23.2033, ge=-90.0, le=90.0, description="Latitude"),
    longitude: float = Query(default=77.0844, ge=-180.0, le=180.0, description="Longitude"),
    location_name: str = Query(default="Sehore, Madhya Pradesh", description="Location name for reference")
):
    """
    Get localized 5-day weather advisory and farming alerts.
    Includes explicit rain probability and irrigation delay indicators.
    """
    return weather_service.get_weather(latitude, longitude, location_name)

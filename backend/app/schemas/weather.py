from typing import List, Optional
from pydantic import BaseModel


class WeatherForecastDay(BaseModel):
    day: str
    temp_min_c: float
    temp_max_c: float
    condition: str
    precipitation_prob: int
    farming_advisory: str


class WeatherResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    current_temp_c: float
    humidity_percent: int
    precipitation_prob: int
    wind_speed_kmh: float
    condition: str
    condition_hi: str
    primary_advisory: str
    postpone_irrigation: bool
    forecast_5day: List[WeatherForecastDay]
    data_source: str = "fallback_agri_met"
    is_live_verified: bool = False
    disclaimer: str = "डेमो मौसम पूर्वानुमान (Demo Weather Advisory - Non-verified)"

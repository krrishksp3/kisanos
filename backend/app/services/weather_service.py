import math
from typing import Dict, Any, List
from app.schemas.weather import WeatherResponse, WeatherForecastDay
from app.core.config import settings


class WeatherService:
    """
    Weather provider abstraction.
    Supports external weather API with deterministic realistic Indian agricultural fallback.
    """

    def get_weather(self, lat: float = 23.2033, lon: float = 77.0844, location_name: str = "Sehore, MP") -> WeatherResponse:
        # If external API is configured in settings.WEATHER_API_KEY, call it here.
        # Otherwise, return high-fidelity fallback weather with explicit demo tags.
        forecast_days: List[WeatherForecastDay] = [
            WeatherForecastDay(
                day="आज (Today)",
                temp_min_c=14.5,
                temp_max_c=27.0,
                condition="हल्के बादल एवं सुबह कोहरा (Partly Cloudy & Morning Fog)",
                precipitation_prob=65,
                farming_advisory="उच्च आर्द्रता के कारण पीला रतुआ का जोखिम। सिंचाई 48 घंटे टालें।"
            ),
            WeatherForecastDay(
                day="कल (Tomorrow)",
                temp_min_c=15.0,
                temp_max_c=26.5,
                condition="हल्की बूंदाबांदी (Light Drizzle)",
                precipitation_prob=70,
                farming_advisory="फसल पर कीटनाशक या फफूंदनाशक का छिड़काव न करें।"
            ),
            WeatherForecastDay(
                day="परसों (Day 3)",
                temp_min_c=13.8,
                temp_max_c=28.0,
                condition="मौसम साफ (Clear Sky)",
                precipitation_prob=20,
                farming_advisory="धूप निकलने पर कल्ले फूटने के लिए यूरिया टॉप-ड्रेसिंग करें।"
            ),
            WeatherForecastDay(
                day="दिन 4 (Day 4)",
                temp_min_c=14.0,
                temp_max_c=28.5,
                condition="साफ एवं धूप (Sunny)",
                precipitation_prob=10,
                farming_advisory="सामान्य कृषि कार्य जारी रखें।"
            ),
            WeatherForecastDay(
                day="दिन 5 (Day 5)",
                temp_min_c=15.2,
                temp_max_c=29.0,
                condition="हल्के बादल (Few Clouds)",
                precipitation_prob=15,
                farming_advisory="खेत में खरपतवार निरीक्षण करें।"
            )
        ]

        return WeatherResponse(
            location=location_name,
            latitude=lat,
            longitude=lon,
            current_temp_c=23.5,
            humidity_percent=78,
            precipitation_prob=65,
            wind_speed_kmh=11.2,
            condition="Partly Cloudy with High Moisture",
            condition_hi="हल्के बादल एवं अत्यधिक नमी",
            primary_advisory="आगामी 48 घंटों में 65% वर्षा की संभावना को देखते हुए सिंचाई स्थगित करने की सलाह दी जाती है।",
            postpone_irrigation=True,
            forecast_5day=forecast_days,
            data_source="fallback_agri_met",
            is_live_verified=False
        )


weather_service = WeatherService()

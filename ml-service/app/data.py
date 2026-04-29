from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone
from typing import Literal


AQI_CATEGORIES = (
    (50, "Good"),
    (100, "Moderate"),
    (200, "Poor"),
    (300, "Unhealthy"),
    (10_000, "Hazardous"),
)

CITIES = [
    {"name": "Guwahati", "state": "Assam", "lat": 26.1445, "lon": 91.7362, "population": 1116267, "baselineAqi": 118},
    {"name": "Shillong", "state": "Meghalaya", "lat": 25.5788, "lon": 91.8933, "population": 354759, "baselineAqi": 64},
    {"name": "Itanagar", "state": "Arunachal Pradesh", "lat": 27.0844, "lon": 93.6053, "population": 59490, "baselineAqi": 58},
    {"name": "Kohima", "state": "Nagaland", "lat": 25.6751, "lon": 94.1086, "population": 99039, "baselineAqi": 70},
    {"name": "Imphal", "state": "Manipur", "lat": 24.817, "lon": 93.9368, "population": 268243, "baselineAqi": 86},
    {"name": "Aizawl", "state": "Mizoram", "lat": 23.7271, "lon": 92.7176, "population": 293416, "baselineAqi": 52},
    {"name": "Agartala", "state": "Tripura", "lat": 23.8315, "lon": 91.2868, "population": 400004, "baselineAqi": 102},
    {"name": "Gangtok", "state": "Sikkim", "lat": 27.3314, "lon": 88.6138, "population": 100286, "baselineAqi": 48},
    {"name": "Dibrugarh", "state": "Assam", "lat": 27.4728, "lon": 94.912, "population": 154019, "baselineAqi": 92},
    {"name": "Silchar", "state": "Assam", "lat": 24.8333, "lon": 92.7789, "population": 172830, "baselineAqi": 96},
]


def public_cities() -> list[dict]:
    return [{key: value for key, value in city.items() if key != "baselineAqi"} for city in CITIES]


def find_city(name: str | None = None) -> dict:
    query = (name or "Guwahati").lower()
    return next((city for city in CITIES if city["name"].lower() == query), CITIES[0])


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def get_aqi_category(aqi: float) -> str:
    return next(label for ceiling, label in AQI_CATEGORIES if aqi <= ceiling)


def estimate_aqi_from_pm25(pm25: float) -> int:
    return int(round(clamp(pm25 / 0.42, 0, 500)))


def _city_wave(city_name: str, observed_at: datetime) -> float:
    city_seed = sum(ord(char) for char in city_name)
    hour = observed_at.hour
    day = math.floor(observed_at.timestamp() / 86_400)
    return math.sin((hour + city_seed) / 4) * 12 + math.cos((day + city_seed) / 5) * 9


def generate_reading(city_name: str | None = None, observed_at: datetime | None = None) -> dict:
    city = find_city(city_name)
    observed_at = observed_at or datetime.now(timezone.utc)
    wave = _city_wave(city["name"], observed_at)
    rush_hour = 18 if observed_at.hour in (8, 9, 18, 19, 20) else 0
    aqi = int(round(clamp(city["baselineAqi"] + wave + rush_hour, 22, 260)))
    pm25 = int(round(clamp(aqi * 0.42 + wave, 8, 160)))
    pm10 = int(round(clamp(aqi * 0.76 + wave * 1.2, 18, 260)))

    return {
        "city": {key: value for key, value in city.items() if key != "baselineAqi"},
        "aqi": aqi,
        "category": get_aqi_category(aqi),
        "pollutants": {
            "pm25": pm25,
            "pm10": pm10,
            "co": round(clamp(0.35 + aqi / 220, 0.25, 2.8), 2),
            "no2": int(round(clamp(aqi * 0.22, 8, 80))),
            "so2": int(round(clamp(aqi * 0.1, 3, 45))),
        },
        "weather": {
            "temperature": int(round(clamp(24 + math.sin(observed_at.hour / 3) * 5 + city["lat"] / 20, 10, 36))),
            "humidity": int(round(clamp(70 + math.cos(observed_at.hour / 5) * 12, 38, 96))),
            "windSpeed": round(clamp(1.4 + math.sin(observed_at.hour / 2) * 1.2, 0.4, 5.8), 1),
            "condition": "Mist" if observed_at.hour > 17 or observed_at.hour < 6 else "Partly cloudy",
        },
        "source": "FastAPI synthetic regional dataset",
        "updatedAt": observed_at.isoformat(),
    }


def generate_trend(city_name: str, range_name: Literal["weekly", "monthly"] = "weekly") -> list[dict]:
    count = 30 if range_name == "monthly" else 7
    now = datetime.now(timezone.utc)
    points = []

    for index in range(count - 1, -1, -1):
        observed_at = (now - timedelta(days=index)).replace(hour=12, minute=0, second=0, microsecond=0)
        reading = generate_reading(city_name, observed_at)
        points.append(
            {
                "timestamp": observed_at.isoformat(),
                "aqi": reading["aqi"],
                "pm25": reading["pollutants"]["pm25"],
                "pm10": reading["pollutants"]["pm10"],
                "temperature": reading["weather"]["temperature"],
                "humidity": reading["weather"]["humidity"],
            }
        )

    return points


def generate_comparison() -> list[dict]:
    rows = []
    for city in CITIES:
        reading = generate_reading(city["name"])
        rows.append(
            {
                "city": city["name"],
                "state": city["state"],
                "aqi": reading["aqi"],
                "pm25": reading["pollutants"]["pm25"],
                "pm10": reading["pollutants"]["pm10"],
                "category": reading["category"],
            }
        )
    return sorted(rows, key=lambda item: item["aqi"], reverse=True)


def answer_pollution_question(question: str, city_name: str) -> str:
    reading = generate_reading(city_name)
    lower = question.lower()

    if "pm2" in lower or "pm 2" in lower:
        return (
            f"PM2.5 in {reading['city']['name']} is {reading['pollutants']['pm25']} ug/m3. "
            "Fine particles can travel deep into the lungs, so reduce traffic exposure when readings rise."
        )
    if "pm10" in lower or "dust" in lower:
        return (
            f"PM10 in {reading['city']['name']} is {reading['pollutants']['pm10']} ug/m3. "
            "Road dust, construction, and dry weather are common drivers."
        )
    if "outdoor" in lower or "exercise" in lower or "run" in lower:
        if reading["aqi"] > 100:
            return f"{reading['city']['name']} is at AQI {reading['aqi']}; keep outdoor exercise light and avoid peak traffic hours."
        return f"{reading['city']['name']} is at AQI {reading['aqi']}; outdoor activity is generally acceptable for most people."
    if "mask" in lower or "precaution" in lower:
        if reading["aqi"] > 100:
            return f"Use an N95-style mask outdoors in {reading['city']['name']}, especially near traffic and during rush hours."
        return f"At AQI {reading['aqi']}, a mask is optional for most people, but sensitive groups may prefer one near busy roads."

    return (
        f"{reading['city']['name']} currently has AQI {reading['aqi']} ({reading['category']}). "
        f"PM2.5 is {reading['pollutants']['pm25']} ug/m3, PM10 is {reading['pollutants']['pm10']} ug/m3, "
        f"humidity is {reading['weather']['humidity']}%, and wind is {reading['weather']['windSpeed']} m/s."
    )

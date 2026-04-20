from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pandas as pd


CITY_INDEX = {
    "Guwahati": 1,
    "Shillong": 2,
    "Itanagar": 3,
    "Kohima": 4,
    "Imphal": 5,
    "Aizawl": 6,
    "Agartala": 7,
    "Gangtok": 8,
    "Dibrugarh": 9,
    "Silchar": 10,
}


FEATURE_COLUMNS = [
    "city_index",
    "hour",
    "temperature",
    "humidity",
    "wind_speed",
    "pm25",
    "pm10",
    "co",
    "no2",
    "so2",
    "aqi_lag_1",
    "aqi_lag_24",
]


def rows_from_request(city: str, current, horizon: int) -> tuple[pd.DataFrame, list[datetime]]:
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    rows = []
    timestamps = []
    previous = float(current.aqi)

    for hour in range(1, min(max(horizon, 1), 72) + 1):
        ts = now + timedelta(hours=hour)
        timestamps.append(ts)
        diurnal = 1 if ts.hour in (8, 9, 18, 19, 20) else 0
        rows.append(
            {
                "city_index": CITY_INDEX.get(city, 0),
                "hour": ts.hour,
                "temperature": current.temperature,
                "humidity": current.humidity,
                "wind_speed": current.wind_speed,
                "pm25": current.pm25 + diurnal * 2,
                "pm10": current.pm10 + diurnal * 4,
                "co": current.co,
                "no2": current.no2 + diurnal * 3,
                "so2": current.so2,
                "aqi_lag_1": previous,
                "aqi_lag_24": current.aqi,
            }
        )
        previous = previous + (3 if diurnal else -0.6)

    return pd.DataFrame(rows, columns=FEATURE_COLUMNS), timestamps

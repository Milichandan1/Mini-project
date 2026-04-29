from __future__ import annotations

import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from .features import CITY_INDEX, FEATURE_COLUMNS


MODEL_PATH = Path(os.getenv("MODEL_PATH", "model/pm25_model.joblib"))
DATA_PATH = Path("data/historical_aqi.csv")


def generate_training_data(path: Path = DATA_PATH, days: int = 180) -> pd.DataFrame:
    path.parent.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(42)
    rows = []
    base_aqi = {
        "Guwahati": 118,
        "Shillong": 64,
        "Itanagar": 58,
        "Kohima": 70,
        "Imphal": 86,
        "Aizawl": 52,
        "Agartala": 102,
        "Gangtok": 48,
        "Dibrugarh": 92,
        "Silchar": 96,
    }

    start = pd.Timestamp.utcnow().floor("h") - pd.Timedelta(days=days)
    for city, baseline in base_aqi.items():
        lag_24 = baseline
        lag_1 = baseline
        for hour_index in range(days * 24):
            ts = start + pd.Timedelta(hours=hour_index)
            rush = 18 if ts.hour in (8, 9, 18, 19, 20) else 0
            weather_cycle = np.sin(ts.hour / 3) * 7
            seasonal = np.cos(hour_index / 96) * 10
            humidity = np.clip(70 + np.cos(ts.hour / 4) * 14 + rng.normal(0, 4), 38, 96)
            wind = np.clip(1.8 + np.sin(ts.hour / 5) + rng.normal(0, 0.4), 0.3, 6.0)
            temperature = np.clip(24 + weather_cycle + rng.normal(0, 2), 8, 38)
            aqi = np.clip(baseline + rush + seasonal + humidity * 0.13 - wind * 4 + rng.normal(0, 8), 18, 320)
            pm25 = np.clip(aqi * 0.42 + rng.normal(0, 5), 5, 180)
            pm10 = np.clip(aqi * 0.76 + rng.normal(0, 12), 15, 300)
            co = np.clip(0.35 + aqi / 220 + rng.normal(0, 0.08), 0.2, 3.2)
            no2 = np.clip(aqi * 0.22 + rush * 0.4 + rng.normal(0, 5), 5, 90)
            so2 = np.clip(aqi * 0.1 + rng.normal(0, 2), 2, 45)

            rows.append(
                {
                    "city": city,
                    "timestamp": ts.isoformat(),
                    "city_index": CITY_INDEX[city],
                    "hour": ts.hour,
                    "temperature": round(temperature, 2),
                    "humidity": round(humidity, 2),
                    "wind_speed": round(wind, 2),
                    "pm25": round(pm25, 2),
                    "pm10": round(pm10, 2),
                    "co": round(co, 2),
                    "no2": round(no2, 2),
                    "so2": round(so2, 2),
                    "aqi_lag_1": round(lag_1, 2),
                    "aqi_lag_24": round(lag_24, 2),
                    "aqi": round(aqi, 2),
                }
            )
            lag_24 = rows[-24]["aqi"] if len(rows) >= 24 else lag_24
            lag_1 = aqi

    frame = pd.DataFrame(rows)
    frame.to_csv(path, index=False)
    return frame


def train_model() -> dict:
    frame = pd.read_csv(DATA_PATH) if DATA_PATH.exists() else generate_training_data()
    frame["target_pm25"] = frame.groupby("city")["pm25"].shift(-1)
    frame = frame.dropna(subset=["target_pm25"])
    x = frame[FEATURE_COLUMNS]
    y = frame["target_pm25"]
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

    pipeline = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("model", RandomForestRegressor(n_estimators=260, min_samples_leaf=2, random_state=42, n_jobs=-1)),
        ]
    )
    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    return {
        "model_path": str(MODEL_PATH),
        "target": "pm25",
        "rows": int(len(frame)),
        "mae": round(float(mean_absolute_error(y_test, predictions)), 2),
        "r2": round(float(r2_score(y_test, predictions)), 3),
    }


def load_or_train():
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)
    train_model()
    return joblib.load(MODEL_PATH)

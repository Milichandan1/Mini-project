from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .features import rows_from_request
from .model import load_or_train, train_model
from .schemas import PredictionRequest

app = FastAPI(title="Northeast AQI Prediction Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = load_or_train()


@app.get("/health")
def health():
    return {"status": "ok", "service": "northeast-aqi-ml"}


@app.post("/train")
def train():
    metrics = train_model()
    global model
    model = load_or_train()
    return metrics


@app.post("/predict")
def predict(payload: PredictionRequest):
    features, timestamps = rows_from_request(payload.city, payload.current, payload.horizon)
    raw_predictions = model.predict(features)
    predictions = [
        {
            "hour": index + 1,
            "timestamp": timestamps[index].isoformat(),
            "predictedAqi": int(max(0, round(value))),
        }
        for index, value in enumerate(raw_predictions)
    ]
    return {"city": payload.city, "predictions": predictions}

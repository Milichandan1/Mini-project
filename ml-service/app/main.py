from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .data import answer_pollution_question, estimate_aqi_from_pm25, generate_comparison, generate_reading, generate_trend, public_cities
from .features import rows_from_request
from .model import load_or_train, train_model
from .schemas import ChatRequest, PredictionRequest

app = FastAPI(title="AI Pollution Forecasting API", version="2.0.0")
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
    return {"status": "ok", "service": "fastapi-pollution-forecasting"}


@app.get("/api/health")
def api_health():
    return health()


@app.get("/api/cities")
def cities():
    return public_cities()


@app.get("/api/aqi/live")
def live_reading(city: str = Query(default="Guwahati")):
    return generate_reading(city)


@app.get("/api/analytics/trends")
def trends(city: str = Query(default="Guwahati"), range: str = Query(default="weekly")):
    range_name = "monthly" if range == "monthly" else "weekly"
    return generate_trend(city, range_name)


@app.get("/api/analytics/comparison")
def comparison():
    return generate_comparison()


@app.post("/train")
def train():
    metrics = train_model()
    global model
    model = load_or_train()
    return metrics


@app.post("/predict")
def predict(payload: PredictionRequest):
    return _predict(payload)


@app.post("/api/predict")
def api_predict(payload: PredictionRequest):
    return _predict(payload)


@app.post("/api/chat")
def chat(payload: ChatRequest):
    return {"answer": answer_pollution_question(payload.question, payload.city)}


def _predict(payload: PredictionRequest):
    try:
        current = payload.current_features()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    features, timestamps = rows_from_request(payload.city, current, payload.horizon)
    raw_predictions = model.predict(features)
    predictions = [
        {
            "hour": index + 1,
            "timestamp": timestamps[index].isoformat(),
            "predictedPm25": round(float(max(0, value)), 1),
            "predictedAqi": estimate_aqi_from_pm25(float(value)),
        }
        for index, value in enumerate(raw_predictions)
    ]
    return predictions

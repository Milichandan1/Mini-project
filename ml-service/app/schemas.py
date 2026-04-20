from pydantic import BaseModel, Field


class CurrentReading(BaseModel):
    aqi: float
    temperature: float
    humidity: float
    wind_speed: float = Field(alias="wind_speed")
    pm25: float
    pm10: float
    co: float
    no2: float
    so2: float


class PredictionRequest(BaseModel):
    city: str
    current: CurrentReading
    horizon: int = 48


class PredictionPoint(BaseModel):
    hour: int
    timestamp: str
    predictedAqi: int

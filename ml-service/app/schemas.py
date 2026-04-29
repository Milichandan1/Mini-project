from pydantic import BaseModel, ConfigDict, Field, field_validator


class City(BaseModel):
    name: str
    state: str
    lat: float
    lon: float
    population: int


class Pollutants(BaseModel):
    pm25: float = Field(ge=0)
    pm10: float = Field(ge=0)
    co: float = Field(ge=0)
    no2: float = Field(ge=0)
    so2: float = Field(ge=0)


class Weather(BaseModel):
    temperature: float
    humidity: float = Field(ge=0, le=100)
    wind_speed: float = Field(ge=0, alias="windSpeed")
    condition: str = "Partly cloudy"

    model_config = ConfigDict(populate_by_name=True)


class CurrentReading(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    aqi: float = Field(ge=0)
    temperature: float
    humidity: float = Field(ge=0, le=100)
    wind_speed: float = Field(ge=0, alias="windSpeed")
    pm25: float = Field(ge=0)
    pm10: float = Field(ge=0)
    co: float = Field(ge=0)
    no2: float = Field(ge=0)
    so2: float = Field(ge=0)

    @classmethod
    def from_live_reading(cls, reading: "LiveReading") -> "CurrentReading":
        return cls(
            aqi=reading.aqi,
            temperature=reading.weather.temperature,
            humidity=reading.weather.humidity,
            windSpeed=reading.weather.wind_speed,
            pm25=reading.pollutants.pm25,
            pm10=reading.pollutants.pm10,
            co=reading.pollutants.co,
            no2=reading.pollutants.no2,
            so2=reading.pollutants.so2,
        )


class LiveReading(BaseModel):
    city: City
    aqi: int
    category: str
    pollutants: Pollutants
    weather: Weather
    source: str
    updatedAt: str


class PredictionRequest(BaseModel):
    city: str
    current: CurrentReading | None = None
    reading: LiveReading | None = None
    horizon: int = Field(default=48, ge=1, le=72)

    @field_validator("city")
    @classmethod
    def city_is_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("city is required")
        return value.strip()

    def current_features(self) -> CurrentReading:
        if self.current is not None:
            return self.current
        if self.reading is not None:
            return CurrentReading.from_live_reading(self.reading)
        raise ValueError("Either current or reading is required.")


class PredictionPoint(BaseModel):
    hour: int
    timestamp: str
    predictedPm25: float
    predictedAqi: int


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    city: str = "Guwahati"

export type AqiCategory = "Good" | "Moderate" | "Poor" | "Unhealthy" | "Hazardous";

export interface City {
  name: string;
  state: string;
  lat: number;
  lon: number;
  population: number;
}

export interface Pollutants {
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
}

export interface Weather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
}

export interface LiveReading {
  city: City;
  aqi: number;
  category: AqiCategory;
  pollutants: Pollutants;
  weather: Weather;
  source: string;
  updatedAt: string;
}

export interface TrendPoint {
  timestamp: string;
  aqi: number;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
}

export interface PredictionPoint {
  hour: number;
  timestamp: string;
  predictedAqi: number;
}

export interface ComparisonPoint {
  city: string;
  state: string;
  aqi: number;
  pm25: number;
  pm10: number;
  category: AqiCategory;
}

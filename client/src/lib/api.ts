import { ComparisonPoint, LiveReading, PredictionPoint, TrendPoint } from "./types";
import { cities } from "../data/cities";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit, fallback?: () => T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });

    if (!response.ok) {
      throw new ApiError(`Request failed: ${response.status}`, response.status);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (fallback) {
      return fallback();
    }
    throw error;
  }
}

function categoryFromAqi(aqi: number) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 200) return "Poor";
  if (aqi <= 300) return "Unhealthy";
  return "Hazardous";
}

function citySeed(city: string) {
  return [...city].reduce((total, letter) => total + letter.charCodeAt(0), 0);
}

function liveFallback(cityName: string): LiveReading {
  const city = cities.find((item) => item.name === cityName) ?? cities[0];
  const seed = citySeed(city.name);
  const pm25 = 34 + (seed % 56);
  const pm10 = pm25 + 28 + (seed % 22);
  const aqi = Math.round(pm25 * 2.3 + (seed % 24));

  return {
    city,
    aqi,
    category: categoryFromAqi(aqi),
    pollutants: {
      pm25,
      pm10,
      co: Number((0.6 + (seed % 8) / 10).toFixed(1)),
      no2: 18 + (seed % 30),
      so2: 6 + (seed % 14)
    },
    weather: {
      temperature: 23 + (seed % 9),
      humidity: 58 + (seed % 24),
      windSpeed: Number((1.4 + (seed % 28) / 10).toFixed(1)),
      condition: seed % 2 === 0 ? "Partly cloudy" : "Hazy"
    },
    source: "Vercel demo fallback",
    updatedAt: new Date().toISOString()
  };
}

function trendFallback(cityName: string, range: "weekly" | "monthly"): TrendPoint[] {
  const live = liveFallback(cityName);
  const points = range === "weekly" ? 7 : 30;
  const now = Date.now();

  return Array.from({ length: points }, (_, index) => {
    const wave = Math.sin(index / 2) * 10;
    const aqi = Math.max(20, Math.round(live.aqi - points + index * 1.6 + wave));

    return {
      timestamp: new Date(now - (points - index - 1) * 24 * 60 * 60 * 1000).toISOString(),
      aqi,
      pm25: Math.round(aqi / 2.4),
      pm10: Math.round(aqi / 1.55),
      temperature: live.weather.temperature + Math.round(Math.sin(index / 3) * 2),
      humidity: live.weather.humidity + Math.round(Math.cos(index / 3) * 4)
    };
  });
}

function comparisonFallback(): ComparisonPoint[] {
  return cities.map((city) => {
    const live = liveFallback(city.name);
    return {
      city: city.name,
      state: city.state,
      aqi: live.aqi,
      pm25: live.pollutants.pm25,
      pm10: live.pollutants.pm10,
      category: live.category
    };
  });
}

function predictionFallback(reading: LiveReading): PredictionPoint[] {
  const now = Date.now();
  return Array.from({ length: 48 }, (_, index) => {
    const hour = index + 1;
    const predictedPm25 = Math.max(8, reading.pollutants.pm25 + Math.sin(hour / 4) * 8 - reading.weather.windSpeed * 1.5);
    return {
      hour,
      timestamp: new Date(now + hour * 60 * 60 * 1000).toISOString(),
      predictedPm25: Number(predictedPm25.toFixed(1)),
      predictedAqi: Math.round(predictedPm25 * 2.4)
    };
  });
}

export const api = {
  cities: () => request("/cities", undefined, () => cities),
  live: (city: string) => request<LiveReading>(`/aqi/live?city=${encodeURIComponent(city)}`, undefined, () => liveFallback(city)),
  trends: (city: string, range: "weekly" | "monthly") =>
    request<TrendPoint[]>(`/analytics/trends?city=${encodeURIComponent(city)}&range=${range}`, undefined, () => trendFallback(city, range)),
  comparison: () => request<ComparisonPoint[]>("/analytics/comparison", undefined, comparisonFallback),
  predict: (reading: LiveReading) =>
    request<PredictionPoint[]>("/predict", {
      method: "POST",
      body: JSON.stringify({ city: reading.city.name, reading, horizon: 48 })
    }, () => predictionFallback(reading)),
  chat: (question: string, city: string) =>
    request<{ answer: string }>("/chat", {
      method: "POST",
      body: JSON.stringify({ question, city })
    }, () => ({
      answer: `${city} is currently using demo air-quality data on Vercel. For ${question.toLowerCase()}, watch PM2.5, wind speed, and the AQI category before planning long outdoor activity.`
    }))
};

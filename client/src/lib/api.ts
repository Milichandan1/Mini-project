import { ComparisonPoint, LiveReading, PredictionPoint, TrendPoint } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  cities: () => request("/cities"),
  live: (city: string) => request<LiveReading>(`/aqi/live?city=${encodeURIComponent(city)}`),
  trends: (city: string, range: "weekly" | "monthly") =>
    request<TrendPoint[]>(`/analytics/trends?city=${encodeURIComponent(city)}&range=${range}`),
  comparison: () => request<ComparisonPoint[]>("/analytics/comparison"),
  predict: (reading: LiveReading) =>
    request<PredictionPoint[]>("/predict", {
      method: "POST",
      body: JSON.stringify({ city: reading.city.name, reading, horizon: 48 })
    }),
  chat: (question: string, city: string) =>
    request<{ answer: string }>("/chat", {
      method: "POST",
      body: JSON.stringify({ question, city })
    })
};

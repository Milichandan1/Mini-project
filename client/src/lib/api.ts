import { Booking, ComparisonPoint, Destination, LiveReading, PredictionPoint, TrendPoint, User } from "./types";

const DEFAULT_API_BASE_URL = "/api";
const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL);
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  code: "offline" | "timeout" | "http";
  status?: number;

  constructor(message: string, code: "offline" | "timeout" | "http", status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

function normalizeBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim();
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

async function request<T>(path: string, options?: RequestInit & { token?: string }): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const { token, headers, ...restOptions } = options ?? {};

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      },
      ...restOptions,
      signal: controller.signal
    });
  } catch (error) {
    window.clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        "The API is taking too long to respond. Check the backend service or your network and try again.",
        "timeout"
      );
    }

    throw new ApiError(
      "API server is not reachable. Start FastAPI with `npm run start` or run `npm run dev` from the project root.",
      "offline"
    );
  }

  window.clearTimeout(timeoutId);

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new ApiError(message, "http", response.status);
  }

  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { detail?: string; message?: string };
    const message = payload.message ?? payload.detail;
    if (message) {
      return `API request failed (${response.status}): ${message}`;
    }
  } catch {
    // Ignore JSON parse failures and fall back to status text.
  }

  return `API request failed (${response.status}): ${response.statusText || "Unexpected backend response"}`;
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
    }),
  destinations: (params: { search?: string; region?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.region) query.set("region", params.region);
    if (params.category) query.set("category", params.category);
    return request<{ destinations: Destination[] }>(`/destinations?${query.toString()}`);
  },
  register: (payload: { name: string; email: string; password: string }) =>
    request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  me: (token: string) => request<{ user: User }>("/auth/me", { token }),
  bookings: (token: string) => request<{ bookings: Booking[] }>("/bookings", { token }),
  createBooking: (
    token: string,
    payload: { destinationId: string; travelDate: string; guests: number; fullName: string; phone: string; notes: string }
  ) =>
    request<{ booking: Booking }>("/bookings", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }),
  contact: (payload: { name: string; email: string; subject: string; message: string }) =>
    request<{ message: string; email: { sent: boolean; reason?: string } }>("/contact", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};

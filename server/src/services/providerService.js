import axios from "axios";
import { env } from "../config/env.js";
import { getAqiCategory, pollutantAqi } from "./aqiUtils.js";

export async function fetchOpenWeather(city) {
  if (!env.openWeatherApiKey) return null;

  const [weatherResponse, airResponse] = await Promise.all([
    axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: { lat: city.lat, lon: city.lon, appid: env.openWeatherApiKey, units: "metric" },
      timeout: 6000
    }),
    axios.get("https://api.openweathermap.org/data/2.5/air_pollution", {
      params: { lat: city.lat, lon: city.lon, appid: env.openWeatherApiKey },
      timeout: 6000
    })
  ]);

  const components = airResponse.data.list?.[0]?.components ?? {};
  const pollutants = {
    pm25: Math.round(components.pm2_5 ?? 0),
    pm10: Math.round(components.pm10 ?? 0),
    co: Number(((components.co ?? 0) / 1000).toFixed(2)),
    no2: Math.round(components.no2 ?? 0),
    so2: Math.round(components.so2 ?? 0)
  };
  const aqi = pollutantAqi(pollutants);

  return {
    city: {
      name: city.name,
      state: city.state,
      lat: city.lat,
      lon: city.lon,
      population: city.population
    },
    aqi,
    category: getAqiCategory(aqi),
    pollutants,
    weather: {
      temperature: Math.round(weatherResponse.data.main.temp),
      humidity: weatherResponse.data.main.humidity,
      windSpeed: Number(weatherResponse.data.wind.speed.toFixed(1)),
      condition: weatherResponse.data.weather?.[0]?.main ?? "Observed"
    },
    source: "OpenWeather",
    updatedAt: new Date().toISOString()
  };
}

export async function fetchWaqiAqi(city) {
  if (!env.waqiToken) return null;

  const response = await axios.get(`https://api.waqi.info/feed/${encodeURIComponent(city.name)}/`, {
    params: { token: env.waqiToken },
    timeout: 6000
  });

  if (response.data.status !== "ok") return null;
  const aqi = Number(response.data.data.aqi);
  if (!Number.isFinite(aqi)) return null;

  return {
    aqi,
    category: getAqiCategory(aqi),
    source: "AQICN/WAQI"
  };
}

import mongoose from "mongoose";
import { findCity } from "../data/cities.js";
import { Reading } from "../models/Reading.js";
import { generateReading } from "./fallbackDataService.js";
import { fetchOpenWeather, fetchWaqiAqi } from "./providerService.js";

export async function getLiveReading(cityName) {
  const city = findCity(cityName);

  try {
    const [openWeather, waqi] = await Promise.allSettled([fetchOpenWeather(city), fetchWaqiAqi(city)]);
    const weatherReading = openWeather.status === "fulfilled" ? openWeather.value : null;
    const waqiReading = waqi.status === "fulfilled" ? waqi.value : null;

    const reading = weatherReading
      ? {
          ...weatherReading,
          ...(waqiReading
            ? { aqi: waqiReading.aqi, category: waqiReading.category, source: `${waqiReading.source} + OpenWeather` }
            : {})
        }
      : generateReading(city);

    await persistReading(reading);
    return reading;
  } catch {
    const reading = generateReading(city);
    await persistReading(reading);
    return reading;
  }
}

async function persistReading(reading) {
  if (mongoose.connection.readyState !== 1) return;

  await Reading.create({
    city: reading.city.name,
    state: reading.city.state,
    aqi: reading.aqi,
    category: reading.category,
    pollutants: reading.pollutants,
    weather: reading.weather,
    source: reading.source,
    observedAt: new Date(reading.updatedAt)
  });
}

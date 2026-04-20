import mongoose from "mongoose";
import { cities, findCity } from "../data/cities.js";
import { Reading } from "../models/Reading.js";
import { generateComparison, generateTrend } from "./fallbackDataService.js";

export async function getTrend(cityName, range = "weekly") {
  const city = findCity(cityName);
  const days = range === "monthly" ? 30 : 7;

  if (mongoose.connection.readyState === 1) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const rows = await Reading.find({ city: city.name, observedAt: { $gte: since } })
      .sort({ observedAt: 1 })
      .limit(days * 24)
      .lean();

    if (rows.length >= Math.min(4, days)) {
      return rows.map((row) => ({
        timestamp: row.observedAt.toISOString(),
        aqi: row.aqi,
        pm25: row.pollutants.pm25,
        pm10: row.pollutants.pm10,
        temperature: row.weather.temperature,
        humidity: row.weather.humidity
      }));
    }
  }

  return generateTrend(city, days);
}

export async function getComparison() {
  if (mongoose.connection.readyState === 1) {
    const rows = await Promise.all(
      cities.map((city) => Reading.findOne({ city: city.name }).sort({ observedAt: -1 }).lean())
    );

    const completeRows = rows.filter(Boolean);
    if (completeRows.length >= 4) {
      return completeRows
        .map((row) => ({
          city: row.city,
          state: row.state,
          aqi: row.aqi,
          pm25: row.pollutants.pm25,
          pm10: row.pollutants.pm10,
          category: row.category
        }))
        .sort((a, b) => b.aqi - a.aqi);
    }
  }

  return generateComparison();
}

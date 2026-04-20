import axios from "axios";
import { env } from "../config/env.js";

function localPrediction(reading, horizon = 48) {
  const points = [];
  const base = reading.aqi;
  const now = new Date();

  for (let hour = 1; hour <= horizon; hour += 1) {
    const timestamp = new Date(now.getTime() + hour * 3_600_000);
    const dailyCycle = Math.sin((timestamp.getHours() - 7) / 3) * 9;
    const windAdjustment = reading.weather.windSpeed > 3 ? -4 : 3;
    const humidityAdjustment = reading.weather.humidity > 82 ? 5 : 0;
    points.push({
      hour,
      timestamp: timestamp.toISOString(),
      predictedAqi: Math.round(Math.max(20, base + dailyCycle + windAdjustment + humidityAdjustment + hour * 0.08))
    });
  }

  return points;
}

export async function predictAqi({ city, reading, horizon = 48 }) {
  try {
    const response = await axios.post(
      `${env.mlServiceUrl}/predict`,
      {
        city,
        horizon,
        current: {
          aqi: reading.aqi,
          temperature: reading.weather.temperature,
          humidity: reading.weather.humidity,
          wind_speed: reading.weather.windSpeed,
          pm25: reading.pollutants.pm25,
          pm10: reading.pollutants.pm10,
          co: reading.pollutants.co,
          no2: reading.pollutants.no2,
          so2: reading.pollutants.so2
        }
      },
      { timeout: 5000 }
    );

    return response.data.predictions;
  } catch {
    return localPrediction(reading, horizon);
  }
}

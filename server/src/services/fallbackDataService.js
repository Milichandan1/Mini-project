import { cities } from "../data/cities.js";
import { clamp, getAqiCategory } from "./aqiUtils.js";

function cityWave(cityName, date = new Date()) {
  const citySeed = cityName.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const hour = date.getHours();
  const day = Math.floor(date.getTime() / 86_400_000);
  return Math.sin((hour + citySeed) / 4) * 12 + Math.cos((day + citySeed) / 5) * 9;
}

export function generateReading(city, date = new Date()) {
  const wave = cityWave(city.name, date);
  const rushHour = [8, 9, 18, 19, 20].includes(date.getHours()) ? 18 : 0;
  const aqi = Math.round(clamp(city.baselineAqi + wave + rushHour, 22, 260));
  const pm25 = Math.round(clamp(aqi * 0.42 + wave, 8, 160));
  const pm10 = Math.round(clamp(aqi * 0.76 + wave * 1.2, 18, 260));

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
    pollutants: {
      pm25,
      pm10,
      co: Number(clamp(0.35 + aqi / 220, 0.25, 2.8).toFixed(2)),
      no2: Math.round(clamp(aqi * 0.22, 8, 80)),
      so2: Math.round(clamp(aqi * 0.1, 3, 45))
    },
    weather: {
      temperature: Math.round(clamp(24 + Math.sin(date.getHours() / 3) * 5 + city.lat / 20, 10, 36)),
      humidity: Math.round(clamp(70 + Math.cos(date.getHours() / 5) * 12, 38, 96)),
      windSpeed: Number(clamp(1.4 + Math.sin(date.getHours() / 2) * 1.2, 0.4, 5.8).toFixed(1)),
      condition: date.getHours() > 17 || date.getHours() < 6 ? "Mist" : "Partly cloudy"
    },
    source: "seeded regional model",
    updatedAt: date.toISOString()
  };
}

export function generateTrend(city, days) {
  const points = [];
  const now = new Date();
  const count = days === 7 ? 7 : 30;

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - index);
    date.setHours(12, 0, 0, 0);
    const reading = generateReading(city, date);
    points.push({
      timestamp: date.toISOString(),
      aqi: reading.aqi,
      pm25: reading.pollutants.pm25,
      pm10: reading.pollutants.pm10,
      temperature: reading.weather.temperature,
      humidity: reading.weather.humidity
    });
  }

  return points;
}

export function generateComparison() {
  return cities
    .map((city) => {
      const reading = generateReading(city);
      return {
        city: city.name,
        state: city.state,
        aqi: reading.aqi,
        pm25: reading.pollutants.pm25,
        pm10: reading.pollutants.pm10,
        category: reading.category
      };
    })
    .sort((a, b) => b.aqi - a.aqi);
}

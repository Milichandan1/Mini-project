import { getLiveReading } from "./readingService.js";

export async function answerPollutionQuestion(question, cityName) {
  const reading = await getLiveReading(cityName);
  const lower = question.toLowerCase();

  if (lower.includes("pm2") || lower.includes("pm 2")) {
    return `PM2.5 in ${reading.city.name} is ${reading.pollutants.pm25}. Fine particles can enter deep lung tissue, so use a well-fitting mask when AQI is above 100 or traffic exposure is high.`;
  }

  if (lower.includes("pm10") || lower.includes("dust")) {
    return `PM10 in ${reading.city.name} is ${reading.pollutants.pm10}. It often rises with road dust, construction, and dry weather, so wet sweeping and reduced exposure near busy roads help.`;
  }

  if (lower.includes("outdoor") || lower.includes("exercise") || lower.includes("run")) {
    return reading.aqi > 100
      ? `${reading.city.name} is at AQI ${reading.aqi}, so keep outdoor exercise light and avoid peak traffic hours.`
      : `${reading.city.name} is at AQI ${reading.aqi}. Outdoor activity is generally acceptable, but sensitive groups should still watch symptoms.`;
  }

  if (lower.includes("mask") || lower.includes("precaution")) {
    return reading.aqi > 100
      ? `Use an N95 or equivalent mask outdoors in ${reading.city.name}, close windows near traffic, and avoid strenuous activity until AQI improves.`
      : `A mask is optional for most people at AQI ${reading.aqi}, but sensitive groups may still prefer one near traffic corridors.`;
  }

  return `${reading.city.name} currently has AQI ${reading.aqi} (${reading.category}). PM2.5 is ${reading.pollutants.pm25}, PM10 is ${reading.pollutants.pm10}, humidity is ${reading.weather.humidity}%, and wind is ${reading.weather.windSpeed} m/s.`;
}

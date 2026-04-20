import { AqiCategory } from "./types";

export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 200) return "Poor";
  if (aqi <= 300) return "Unhealthy";
  return "Hazardous";
}

export function getAqiColor(aqi: number) {
  if (aqi <= 50) return "#45c4a0";
  if (aqi <= 100) return "#f3b743";
  if (aqi <= 200) return "#ff8a4c";
  if (aqi <= 300) return "#ff6b5f";
  return "#b66cff";
}

export function getPrecaution(aqi: number) {
  if (aqi <= 50) return "Air is clean. Keep windows open when traffic is low.";
  if (aqi <= 100) return "Sensitive groups should watch prolonged outdoor activity.";
  if (aqi <= 200) return "Use a mask near traffic and avoid intense outdoor exercise.";
  if (aqi <= 300) return "Keep outdoor time short and use indoor filtration if available.";
  return "Avoid outdoor activity and follow local health advisories.";
}

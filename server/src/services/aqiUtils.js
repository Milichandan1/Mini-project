export function getAqiCategory(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 200) return "Poor";
  if (aqi <= 300) return "Unhealthy";
  return "Hazardous";
}

function interpolate(value, breakpoints) {
  for (const [cLow, cHigh, iLow, iHigh] of breakpoints) {
    if (value >= cLow && value <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (value - cLow) + iLow);
    }
  }
  return 400;
}

export function pollutantAqi(pollutants) {
  const pm25 = interpolate(pollutants.pm25, [
    [0, 30, 0, 50],
    [31, 60, 51, 100],
    [61, 90, 101, 200],
    [91, 120, 201, 300],
    [121, 250, 301, 500]
  ]);
  const pm10 = interpolate(pollutants.pm10, [
    [0, 50, 0, 50],
    [51, 100, 51, 100],
    [101, 250, 101, 200],
    [251, 350, 201, 300],
    [351, 430, 301, 500]
  ]);

  return Math.max(pm25, pm10);
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

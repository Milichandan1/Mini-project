import { cities } from "../data/cities.js";
import { getLiveReading } from "../services/readingService.js";

export function listCities(_req, res) {
  res.json(cities.map(({ baselineAqi, ...city }) => city));
}

export async function liveReading(req, res, next) {
  try {
    const reading = await getLiveReading(req.query.city);
    res.json(reading);
  } catch (error) {
    next(error);
  }
}

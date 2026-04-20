import { getComparison, getTrend } from "../services/analyticsService.js";

export async function trends(req, res, next) {
  try {
    res.json(await getTrend(req.query.city, req.query.range));
  } catch (error) {
    next(error);
  }
}

export async function comparison(_req, res, next) {
  try {
    res.json(await getComparison());
  } catch (error) {
    next(error);
  }
}

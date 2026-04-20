import { predictAqi } from "../services/mlService.js";

export async function predict(req, res, next) {
  try {
    const { city, reading, horizon } = req.body;
    if (!reading) {
      return res.status(400).json({ message: "reading is required" });
    }
    res.json(await predictAqi({ city, reading, horizon }));
  } catch (error) {
    next(error);
  }
}

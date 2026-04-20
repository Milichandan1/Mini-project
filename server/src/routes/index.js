import { Router } from "express";
import { listCities, liveReading } from "../controllers/aqiController.js";
import { comparison, trends } from "../controllers/analyticsController.js";
import { chat } from "../controllers/chatController.js";
import { predict } from "../controllers/predictionController.js";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "northeast-pollution-api", timestamp: new Date().toISOString() });
});

router.get("/cities", listCities);
router.get("/aqi/live", liveReading);
router.get("/analytics/trends", trends);
router.get("/analytics/comparison", comparison);
router.post("/predict", predict);
router.post("/chat", chat);

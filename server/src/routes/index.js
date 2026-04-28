import { Router } from "express";
import { login, me, register } from "../controllers/authController.js";
import { createBooking, listMyBookings } from "../controllers/bookingController.js";
import { createContact } from "../controllers/contactController.js";
import { listDestinations } from "../controllers/destinationController.js";
import { requireAuth } from "../middleware/auth.js";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "voyage-travel-api", timestamp: new Date().toISOString() });
});

router.get("/destinations", listDestinations);
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", requireAuth, me);
router.get("/bookings", requireAuth, listMyBookings);
router.post("/bookings", requireAuth, createBooking);
router.post("/contact", createContact);

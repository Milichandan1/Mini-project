import mongoose from "mongoose";
import { destinations } from "../data/destinations.js";
import { Booking } from "../models/Booking.js";

function assertMongo() {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error("MongoDB is not connected. Set MONGODB_URI to enable bookings.");
    error.status = 503;
    throw error;
  }
}

export async function listMyBookings(req, res, next) {
  try {
    assertMongo();
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
}

export async function createBooking(req, res, next) {
  try {
    assertMongo();
    const { destinationId, travelDate, guests, fullName, phone, notes } = req.body;
    const destination = destinations.find((item) => item.id === destinationId);
    const guestCount = Number(guests);
    const parsedDate = new Date(travelDate);

    if (!destination) {
      return res.status(400).json({ message: "Please choose a valid destination." });
    }
    if (!fullName || !phone || Number.isNaN(parsedDate.getTime()) || parsedDate < new Date()) {
      return res.status(400).json({ message: "Full name, phone, and a future travel date are required." });
    }
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 12) {
      return res.status(400).json({ message: "Guests must be between 1 and 12." });
    }

    const booking = await Booking.create({
      user: req.user._id,
      destinationId,
      destinationName: destination.name,
      travelDate: parsedDate,
      guests: guestCount,
      fullName,
      phone,
      notes,
      totalPrice: destination.price * guestCount
    });

    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
}

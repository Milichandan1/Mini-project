import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    destinationId: { type: String, required: true },
    destinationName: { type: String, required: true },
    travelDate: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1, max: 12 },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, default: "" },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["confirmed", "pending"], default: "confirmed" }
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);

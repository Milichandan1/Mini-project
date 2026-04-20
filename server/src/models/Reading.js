import mongoose from "mongoose";

const readingSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, index: true },
    state: String,
    aqi: Number,
    category: String,
    pollutants: {
      pm25: Number,
      pm10: Number,
      co: Number,
      no2: Number,
      so2: Number
    },
    weather: {
      temperature: Number,
      humidity: Number,
      windSpeed: Number,
      condition: String
    },
    source: String,
    observedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export const Reading = mongoose.models.Reading ?? mongoose.model("Reading", readingSchema);

import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb() {
  if (!env.mongoUri) {
    console.log("MongoDB disabled: MONGODB_URI not set");
    return false;
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.warn("MongoDB unavailable, continuing with live/fallback data:", error.message);
    return false;
  }
}

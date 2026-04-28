import mongoose from "mongoose";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

function assertMongo() {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error("MongoDB is not connected. Set MONGODB_URI to enable authentication.");
    error.status = 503;
    throw error;
  }
}

function issueSession(user) {
  return { user: user.toSafeJSON(), token: signToken({ sub: user._id.toString(), email: user.email }) };
}

export async function register(req, res, next) {
  try {
    assertMongo();
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ message: "Name, email, and an 8+ character password are required." });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = new User({ name, email });
    user.setPassword(password);
    await user.save();
    return res.status(201).json(issueSession(user));
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    assertMongo();
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email ?? "").toLowerCase() });
    if (!user || !user.validatePassword(String(password ?? ""))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json(issueSession(user));
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

import { User } from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

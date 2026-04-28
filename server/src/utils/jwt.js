import crypto from "crypto";
import { env } from "../config/env.js";

function base64Url(input) {
  return Buffer.from(JSON.stringify(input)).toString("base64url");
}

export function signToken(payload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };
  const header = { alg: "HS256", typ: "JWT" };
  const unsigned = `${base64Url(header)}.${base64Url(body)}`;
  const signature = crypto.createHmac("sha256", env.jwtSecret).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

export function verifyToken(token) {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    throw new Error("Invalid token");
  }

  const unsigned = `${header}.${payload}`;
  const expected = crypto.createHmac("sha256", env.jwtSecret).update(unsigned).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("Invalid token signature");
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return decoded;
}

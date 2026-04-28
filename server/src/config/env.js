import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET ?? "change-this-secret-before-production",
  resendApiKey: process.env.RESEND_API_KEY,
  contactEmailTo: process.env.CONTACT_EMAIL_TO,
  contactEmailFrom: process.env.CONTACT_EMAIL_FROM ?? "onboarding@resend.dev"
};

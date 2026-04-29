import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI,
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
  waqiToken: process.env.WAQI_TOKEN,
  mlServiceUrl: process.env.ML_SERVICE_URL ?? "http://localhost:8000"
};

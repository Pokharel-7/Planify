import dotenv from "dotenv";
import path from "path";

// always load .env from project root (works in dev + dist)
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

export const env = {
  MONGODB_URI: process.env.MONGO_URI as string,
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET as string,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
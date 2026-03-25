import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import conncetDB from "./database/connction.js";
import authRoutes from "./routes/auth.routes.js";
import taskRouter from "./routes/task.routes.js";
import boardRoutes from "./routes/board.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { cleanupTempFolder } from "./library/cloudinary.js";
import { API_BODY_LIMIT, CORS_ORIGINS } from "./config/security.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestSanitizer } from "./middleware/requestSanitizer.js";
import { logger } from "./library/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const frontendDist = path.join(repoRoot, "frontend", "dist");
const tempDir = path.join(os.tmpdir(), "task-management-system");
const PORT = process.env.PORT || 9000;

let initializationPromise;

export const initializeAppResources = async () => {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      await conncetDB();
      await cleanupTempFolder(tempDir);
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
};

const allowedOrigins = new Set([
  ...CORS_ORIGINS,
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
]);

export const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: API_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: API_BODY_LIMIT }));
app.use(cookieParser());

const apiCors = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(requestSanitizer);
app.use((req, res, next) => {
  logger.info("Incoming request", { method: req.method, path: req.originalUrl });
  next();
});

app.use("/api", apiCors);
app.use("/api/auth", authRoutes);
app.use("/api/task", taskRouter);
app.use("/api/board", boardRoutes);
app.use("/api/notifications", notificationRoutes);

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

    return res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

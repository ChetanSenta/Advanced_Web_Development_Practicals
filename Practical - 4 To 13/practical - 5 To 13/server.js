import "dotenv/config";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Task from "./models/Task.js";
import User from "./models/User.js";
import aiRoutes from "./routes/aiRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigins = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);

app.use((request, _response, next) => {
  console.log(`${request.method} ${request.originalUrl} ${new Date().toISOString()}`);
  next();
});
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by the task API."));
  },
}));
app.use(express.json());

app.get("/", (_request, response) => response.status(200).json({
  message: "Task API is running.",
  endpoints: ["/health", "/register", "/login", "/tasks", "/api/ai/generate-description"],
}));

app.get("/health", (_request, response) => response.status(200).json({ message: "Task API is running." }));

app.post("/register", async (request, response, next) => {
  try {
    const { email, password } = request.body || {};
    const details = [];

    if (typeof email !== "string" || !email.trim()) {
      details.push({ field: "email", message: "Email is required." });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      details.push({ field: "email", message: "Enter a valid email address." });
    }
    if (typeof password !== "string" || !password) {
      details.push({ field: "password", message: "Password is required." });
    } else if (password.length < 6) {
      details.push({ field: "password", message: "Password must be at least 6 characters." });
    }
    if (details.length > 0) {
      return response.status(400).json({ error: "Validation failed.", details });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return response.status(409).json({ message: "An account with this email already exists." });
    }
    const user = await User.create({
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
    });
    return response.status(201).json({ id: user._id, email: user.email });
  } catch (error) {
    return next(error);
  }
});

app.post("/login", async (request, response, next) => {
  try {
    const { email, password } = request.body || {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return response.status(400).json({ message: "Email and password are required." });
    }

    if (!process.env.JWT_SECRET) return next(new Error("JWT_SECRET is not configured."));

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return response.status(401).json({ message: "Invalid email or password." });
    }
    return response.status(200).json({
      token: jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" }),
    });
  } catch (error) {
    return next(error);
  }
});

app.use("/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use((_request, response) => response.status(404).json({ message: "Route not found." }));

app.use((error, _request, response, _next) => {
  console.error("[server] request failed", error);
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return response.status(400).json({ error: "Validation failed.", message: "Request body must be valid JSON." });
  }
  if (error.message === "Origin is not allowed by the task API.") {
    return response.status(403).json({ message: error.message });
  }
  if (error.name === "ValidationError") {
    return response.status(400).json({
      error: "Validation failed.",
      details: Object.values(error.errors).map(({ path, message }) => ({ field: path, message })),
    });
  }
  if (error.name === "CastError") return response.status(404).json({ message: "Task not found." });
  if (error.code === 11000) return response.status(409).json({ message: "An account with this email already exists." });
  return response.status(500).json({ error: "Something went wrong." });
});

export async function startServer() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error("MONGODB_URI and JWT_SECRET must be configured.");
  }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  app.listen(port, () => console.log(`Task API listening on http://localhost:${port}`));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  startServer().catch((error) => {
    console.error("Unable to start server:", error.message);
    process.exitCode = 1;
  });
}

export { app };

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import uploadRoutes from "./routes/upload";
import transcribeRoutes from "./routes/transcribe";
import renderRoutes from "./routes/render";

// Polyfill File API for Node.js < 20 (OpenAI SDK requirement)
// This ensures OpenAI SDK works even if Node version doesn't have File globally
if (typeof globalThis.File === "undefined") {
  try {
    const { File } = require("node:buffer");
    globalThis.File = File;
  } catch (e) {
    console.warn("Could not polyfill File API. Node 20+ recommended.");
  }
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration - allow frontend domains
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Local development
      /\.vercel\.app$/, // All Vercel deployments (production + previews)
    ],
    credentials: true,
  })
);
// Increase body size limit for file uploads (50MB)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/transcribe", transcribeRoutes);
app.use("/api/render", renderRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Remotion Captioning Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// Health check for monitoring
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Pre-bundle Remotion composition at startup (makes first render request faster)
// This runs in background, so first request doesn't have to wait for bundling
setTimeout(() => {
  import("./routes/render")
    .then(async (module) => {
      try {
        console.log("Pre-bundling Remotion composition in background...");
        await module.getBundle();
        console.log("Pre-bundling completed - first render will be faster");
      } catch (err: any) {
        console.warn(
          "Pre-bundling failed (will bundle on first request):",
          err.message
        );
      }
    })
    .catch((err) => {
      console.warn(
        "Could not load render module for pre-bundling:",
        err.message
      );
    });
}, 2000); // Wait 2 seconds after server starts

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

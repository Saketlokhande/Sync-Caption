import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import uploadRoutes from "./routes/upload";
import transcribeRoutes from "./routes/transcribe";
import renderRoutes from "./routes/render";

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
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/transcribe", transcribeRoutes);
app.use("/api/render", renderRoutes);

app.get("/", (req, res) => {
  res.send("Remotion Captioning Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

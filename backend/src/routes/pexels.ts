import express from "express";
import axios from "axios";

const router = express.Router();

const PEXELS_API_URL = "https://api.pexels.com/videos";

// Helper function to get API key (reads from env at runtime, not module load time)
const getPexelsApiKey = () => {
  return process.env.PEXELS_API_KEY?.trim() || "YOUR_PEXELS_API_KEY_HERE";
};

// Helper function to validate API key
const validateApiKey = () => {
  const apiKey = getPexelsApiKey();
  if (!apiKey || apiKey === "YOUR_PEXELS_API_KEY_HERE") {
    return {
      valid: false,
      error:
        "Pexels API key is not configured. Please add PEXELS_API_KEY to your .env file. Get your free API key at https://www.pexels.com/api/",
    };
  }
  return { valid: true, apiKey };
};

// Search videos endpoint
router.get("/search", async (req, res) => {
  try {
    const { query, per_page = 15, page = 1 } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    // Validate API key
    const keyValidation = validateApiKey();
    if (!keyValidation.valid) {
      return res.status(401).json({
        error: "Pexels API key not configured",
        details: keyValidation.error,
        hint: "Add PEXELS_API_KEY=your_key_here to your backend/.env file and restart the server",
      });
    }

    const response = await axios.get(`${PEXELS_API_URL}/search`, {
      headers: {
        Authorization: keyValidation.apiKey,
      },
      params: {
        query: query as string,
        per_page: parseInt(per_page as string),
        page: parseInt(page as string),
      },
    });

    // Transform the response to include video file URLs
    const videos = response.data.videos.map((video: any) => ({
      id: video.id,
      width: video.width,
      height: video.height,
      duration: video.duration,
      image: video.image,
      video_files: video.video_files.map((file: any) => ({
        id: file.id,
        quality: file.quality,
        file_type: file.file_type,
        width: file.width,
        height: file.height,
        link: file.link,
        fps: file.fps,
      })),
      video_pictures: video.video_pictures,
    }));

    res.json({
      videos,
      page: response.data.page,
      per_page: response.data.per_page,
      total_results: response.data.total_results,
      next_page: response.data.next_page,
    });
  } catch (error: any) {
    console.error("Pexels API error:", error.response?.data || error.message);

    // Handle 401 Unauthorized specifically
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Pexels API authentication failed",
        details: error.response?.data?.error || "Invalid API key",
        hint: "Please check your PEXELS_API_KEY in the .env file. Get your free API key at https://www.pexels.com/api/",
      });
    }

    res.status(error.response?.status || 500).json({
      error: "Failed to search Pexels videos",
      details: error.response?.data?.error || error.message,
      statusCode: error.response?.status,
    });
  }
});

// Get popular videos endpoint
router.get("/popular", async (req, res) => {
  try {
    const { per_page = 15, page = 1 } = req.query;

    // Validate API key
    const keyValidation = validateApiKey();
    if (!keyValidation.valid) {
      return res.status(401).json({
        error: "Pexels API key not configured",
        details: keyValidation.error,
        hint: "Add PEXELS_API_KEY=your_key_here to your backend/.env file and restart the server",
      });
    }

    const response = await axios.get(`${PEXELS_API_URL}/popular`, {
      headers: {
        Authorization: keyValidation.apiKey,
      },
      params: {
        per_page: parseInt(per_page as string),
        page: parseInt(page as string),
      },
    });

    const videos = response.data.videos.map((video: any) => ({
      id: video.id,
      width: video.width,
      height: video.height,
      duration: video.duration,
      image: video.image,
      video_files: video.video_files.map((file: any) => ({
        id: file.id,
        quality: file.quality,
        file_type: file.file_type,
        width: file.width,
        height: file.height,
        link: file.link,
        fps: file.fps,
      })),
      video_pictures: video.video_pictures,
    }));

    res.json({
      videos,
      page: response.data.page,
      per_page: response.data.per_page,
      total_results: response.data.total_results,
      next_page: response.data.next_page,
    });
  } catch (error: any) {
    console.error("Pexels API error:", error.response?.data || error.message);

    // Handle 401 Unauthorized specifically
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Pexels API authentication failed",
        details: error.response?.data?.error || "Invalid API key",
        hint: "Please check your PEXELS_API_KEY in the .env file. Get your free API key at https://www.pexels.com/api/",
      });
    }

    res.status(error.response?.status || 500).json({
      error: "Failed to fetch popular videos",
      details: error.response?.data?.error || error.message,
      statusCode: error.response?.status,
    });
  }
});

// Test endpoint to check API key status (for debugging)
router.get("/test", (req, res) => {
  const keyValidation = validateApiKey();
  const apiKey = getPexelsApiKey();
  res.json({
    apiKeyConfigured: keyValidation.valid,
    apiKeyPrefix:
      apiKey && apiKey !== "YOUR_PEXELS_API_KEY_HERE"
        ? `${apiKey.substring(0, 10)}...`
        : "Not set",
    message: keyValidation.valid
      ? "API key is configured"
      : keyValidation.error,
    envVarExists: !!process.env.PEXELS_API_KEY,
  });
});

export default router;

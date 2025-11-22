import express from "express";
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "fs";

const router = express.Router();

router.post("/", async (req, res) => {
  const { videoUrl, captions, style, duration, dimensions } = req.body;

  if (!videoUrl || !captions) {
    return res.status(400).json({ error: "Missing videoUrl or captions" });
  }

  // Extract input filename from videoUrl for verification
  const inputFilename = videoUrl.split("/").pop() || "";

  // Verify local file exists if it's a local upload (for validation)
  if (videoUrl.includes("/uploads/")) {
    const localVideoPath = path.join(
      __dirname,
      "../../public/uploads",
      inputFilename
    );
    if (!fs.existsSync(localVideoPath)) {
      return res.status(404).json({ error: "Video file not found on server" });
    }
  }

  // Use the provided videoUrl directly (already a full HTTP URL from frontend)
  // Remotion Video component needs HTTP URL to load the video

  let outputFilename = "";
  try {
    // Calculate duration in frames (30 fps)
    const durationInFrames = duration ? Math.ceil(duration * 30) : 300;

    // 1. Bundle the composition
    const entryPoint = path.join(__dirname, "../remotion/index.ts");
    const bundleLocation = await bundle({
      entryPoint,
      webpackOverride: (config) => config,
    });

    // 2. Select composition with dynamic duration
    const compositionId = "CaptionedVideo";
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: {
        videoUrl,
        captions,
        style: style || "standard",
      },
    });

    // Override the duration and dimensions
    composition.durationInFrames = durationInFrames;
    if (dimensions) {
      composition.width = dimensions.width;
      composition.height = dimensions.height;
    }

    // 3. Render
    outputFilename = `output-${Date.now()}.mp4`;
    const outputLocation = path.join(
      __dirname,
      "../../public/outputs",
      outputFilename
    );

    if (!fs.existsSync(path.dirname(outputLocation))) {
      fs.mkdirSync(path.dirname(outputLocation), { recursive: true });
    }

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
      inputProps: {
        videoUrl,
        captions,
        style: style || "standard",
      },
      timeoutInMilliseconds: 120000, // 2 minutes timeout (increased from default 30s)
      concurrency: 1,
    });

    const outputUrl = `/outputs/${outputFilename}`;

    // Clean up input file after successful render (optional - can be done after download)
    // Uncomment if you want to delete immediately after render:
    // if (inputFilename) {
    //   deleteUploadedFile(inputFilename);
    // }

    res.json({ url: outputUrl, filename: outputFilename });
  } catch (error: any) {
    console.error("Rendering error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      videoUrl: videoUrl,
    });
    res.status(500).json({
      error: "Rendering failed",
      details: error.message,
      hint: "Check server logs for more details",
    });
  }
});

export default router;

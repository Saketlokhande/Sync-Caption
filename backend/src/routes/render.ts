import express from "express";
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "fs";

const router = express.Router();

// Cache the bundle location to avoid rebundling on every request
let cachedBundleLocation: string | null = null;
let bundlePromise: Promise<string> | null = null;

// Function to get or create bundle (cached)
async function getBundle(): Promise<string> {
  // If bundle exists and is valid, return it
  if (cachedBundleLocation && fs.existsSync(cachedBundleLocation)) {
    return cachedBundleLocation;
  }

  // If bundle is in progress, wait for it
  if (bundlePromise) {
    return bundlePromise;
  }

  // Create new bundle
  console.log("Bundling Remotion composition...");
  const entryPoint = path.join(__dirname, "../remotion/index.ts");

  bundlePromise = bundle({
    entryPoint,
    webpackOverride: (config) => config,
    publicDir: undefined,
  })
    .then((location) => {
      cachedBundleLocation = location;
      bundlePromise = null;
      console.log(`Bundle created: ${location}`);
      return location;
    })
    .catch((error) => {
      bundlePromise = null;
      throw error;
    });

  return bundlePromise;
}

// Export getBundle for pre-bundling at startup
export { getBundle };

router.post("/", async (req, res) => {
  const { videoUrl, captions, style, duration, dimensions } = req.body;

  if (!videoUrl || !captions) {
    return res.status(400).json({ error: "Missing videoUrl or captions" });
  }

  // Extract input filename from videoUrl for verification
  const inputFilename = videoUrl.split("/").pop() || "";

  // Convert to localhost URL for faster access (much faster than external HTTP)
  let videoUrlForRemotion = videoUrl;
  if (videoUrl.includes("/uploads/")) {
    const localVideoPath = path.join(
      __dirname,
      "../../public/uploads",
      inputFilename
    );
    if (!fs.existsSync(localVideoPath)) {
      return res.status(404).json({ error: "Video file not found on server" });
    }
    // Use localhost URL - MUCH faster than external URL
    const port = process.env.PORT || 8000;
    videoUrlForRemotion = `http://localhost:${port}/uploads/${inputFilename}`;
    console.log(
      `Using localhost URL for faster access: ${videoUrlForRemotion}`
    );
  }

  let outputFilename = "";
  try {
    console.log("Starting render request...");
    const startTime = Date.now();

    // Calculate duration in frames (30 fps)
    const durationInFrames = duration ? Math.ceil(duration * 30) : 300;

    // 1. Get bundle (cached, only bundles once)
    console.log("Getting bundle...");
    const bundleStartTime = Date.now();
    const bundleLocation = await getBundle();
    console.log(`Bundle retrieved in ${Date.now() - bundleStartTime}ms`);

    // 2. Select composition with dynamic duration
    console.log("Selecting composition...");
    const compositionId = "CaptionedVideo";
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: {
        videoUrl: videoUrlForRemotion,
        captions,
        style: style || "standard",
      },
    });
    console.log(
      `Composition selected: ${compositionId}, duration: ${composition.durationInFrames} frames`
    );

    // Override the duration and dimensions
    composition.durationInFrames = durationInFrames;
    if (dimensions) {
      composition.width = dimensions.width;
      composition.height = dimensions.height;
    }

    // 3. Render
    console.log("Starting video render...");
    outputFilename = `output-${Date.now()}.mp4`;
    const outputLocation = path.join(
      __dirname,
      "../../public/outputs",
      outputFilename
    );

    if (!fs.existsSync(path.dirname(outputLocation))) {
      fs.mkdirSync(path.dirname(outputLocation), { recursive: true });
    }

    const renderStartTime = Date.now();
    console.log(
      `Starting render: ${durationInFrames} frames at ${composition.width}x${composition.height}`
    );

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
      inputProps: {
        videoUrl: videoUrlForRemotion,
        captions,
        style: style || "standard",
      },
      timeoutInMilliseconds: 900000, // 15 minutes timeout (to allow for longer renders)
      concurrency: 1,
      onProgress: ({ renderedFrames }) => {
        if (renderedFrames % 30 === 0) {
          // Log every second (30 fps)
          console.log(
            `Render progress: ${renderedFrames}/${composition.durationInFrames} frames`
          );
        }
      },
    });

    const renderTime = Date.now() - renderStartTime;
    const totalTime = Date.now() - startTime;
    console.log(`Render completed in ${renderTime}ms (total: ${totalTime}ms)`);

    const outputUrl = `/outputs/${outputFilename}`;
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

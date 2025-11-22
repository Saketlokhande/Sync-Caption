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

// Timeout wrapper function
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

router.post("/", async (req, res) => {
  const { videoUrl, captions, style, duration, dimensions } = req.body;

  if (!videoUrl || !captions) {
    return res.status(400).json({ error: "Missing videoUrl or captions" });
  }

  // Extract input filename from videoUrl for verification
  const inputFilename = videoUrl.split("/").pop() || "";

  // Optimize video URL for faster access
  // Use localhost/internal URL instead of external HTTP (much faster)
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

    // Use localhost/internal URL for faster access
    // Works in both local dev and Docker/production (same container)
    const port = process.env.PORT || 8000;
    const isProduction = process.env.NODE_ENV === "production";

    // In production (Docker), use 127.0.0.1 or localhost (both work in same container)
    // In local dev, localhost works perfectly
    // This avoids external HTTP requests and network latency
    videoUrlForRemotion = `http://127.0.0.1:${port}/uploads/${inputFilename}`;
    console.log(
      `Using internal URL for faster access (${
        isProduction ? "production" : "local"
      }): ${videoUrlForRemotion}`
    );
  }

  let outputFilename = "";
  try {
    console.log("Starting render request...");
    const startTime = Date.now();

    const durationInFrames = duration ? Math.ceil(duration * 30) : 300;

    // 1. Get bundle (cached, only bundles once) - with timeout
    console.log("Getting bundle...");
    const bundleStartTime = Date.now();
    const bundleLocation = await withTimeout(
      getBundle(),
      60000,
      "Bundle creation timed out after 1 minute"
    );
    console.log(`Bundle retrieved in ${Date.now() - bundleStartTime}ms`);

    // 2. Select composition - with timeout
    console.log("Selecting composition...");
    const compositionId = "CaptionedVideo";
    const composition = await withTimeout(
      selectComposition({
        serveUrl: bundleLocation,
        id: compositionId,
        inputProps: {
          videoUrl: videoUrlForRemotion,
          captions,
          style: style || "standard",
        },
      }),
      30000,
      "Composition selection timed out after 30 seconds"
    );
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

    await withTimeout(
      renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation,
        inputProps: {
          videoUrl: videoUrlForRemotion,
          captions,
          style: style || "standard",
        },
        timeoutInMilliseconds: 300000,
        concurrency: 2,
        onProgress: ({ renderedFrames }) => {
          const progress = (
            (renderedFrames / composition.durationInFrames) *
            100
          ).toFixed(1);
          console.log(
            `Render progress: ${renderedFrames}/${composition.durationInFrames} frames (${progress}%)`
          );
        },
      }),
      240000,
      "Video rendering timed out after 4 minutes"
    );

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

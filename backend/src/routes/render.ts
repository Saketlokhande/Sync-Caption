import express from 'express';
import path from 'path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import fs from 'fs';

const router = express.Router();

router.post('/', async (req, res) => {
  const { videoUrl, captions, style, duration, dimensions } = req.body;

  if (!videoUrl || !captions) {
    return res.status(400).json({ error: 'Missing videoUrl or captions' });
  }

  try {
    // Calculate duration in frames (30 fps)
    const durationInFrames = duration ? Math.ceil(duration * 30) : 300;
    
    // 1. Bundle the composition
    const entryPoint = path.join(__dirname, '../remotion/index.ts');
    const bundleLocation = await bundle({
      entryPoint,
      webpackOverride: (config) => config,
    });

    // 2. Select composition with dynamic duration
    const compositionId = 'CaptionedVideo';
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: {
        videoUrl,
        captions,
        style: style || 'standard',
      },
    });

    // Override the duration and dimensions
    composition.durationInFrames = durationInFrames;
    if (dimensions) {
      composition.width = dimensions.width;
      composition.height = dimensions.height;
    }

    // 3. Render
    const outputFilename = `output-${Date.now()}.mp4`;
    const outputLocation = path.join(__dirname, '../../public/outputs', outputFilename);
    
    if (!fs.existsSync(path.dirname(outputLocation))) {
        fs.mkdirSync(path.dirname(outputLocation), { recursive: true });
    }

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps: {
        videoUrl,
        captions,
        style: style || 'standard',
      },
    });

    const outputUrl = `/outputs/${outputFilename}`;
    res.json({ url: outputUrl });

  } catch (error: any) {
    console.error('Rendering error:', error);
    res.status(500).json({ error: 'Rendering failed', details: error.message });
  }
});

export default router;

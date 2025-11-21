import express from 'express';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { generateMockCaptions } from '../utils/mockTranscription';

const router = express.Router();
const USE_MOCK = process.env.USE_MOCK_TRANSCRIPTION === 'true';

router.post('/', async (req, res) => {
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  const filePath = path.join(__dirname, '../../public/uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Use mock transcription if enabled
    if (USE_MOCK) {
      console.log('Using mock transcription service (no API key required)');
      const mockCaptions = generateMockCaptions(10);
      return res.json({ captions: mockCaptions });
    }

    // Use OpenAI transcription (default)
    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        details: 'Please add OPENAI_API_KEY to your .env file'
      });
    }

    if (apiKey.startsWith('sk-proj-')) {
      console.log('Using project-scoped API key. Ensure it has Whisper API access.');
    }

    console.log('Using OpenAI Whisper transcription service');
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    // Transform to Remotion-friendly format
    // We'll use the 'words' array if available, otherwise segments
    const captions = transcription.words?.map((word: any) => ({
      text: word.word,
      start: word.start * 1000, // Convert to ms
      end: word.end * 1000,
    })) || [];

    // If words are not available (should be with timestamp_granularities), fallback to segments
    if (captions.length === 0 && transcription.segments) {
        transcription.segments.forEach((segment: any) => {
            captions.push({
                text: segment.text,
                start: segment.start * 1000,
                end: segment.end * 1000
            });
        });
    }

    res.json({ captions });
  } catch (error: any) {
    console.error('Transcription error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    
    // Handle authentication errors specifically
    if (error.status === 401 || error.constructor.name === 'AuthenticationError') {
      return res.status(500).json({ 
        error: 'OpenAI API Authentication Failed', 
        details: 'Your API key is invalid or expired. Please:\n1. Go to https://platform.openai.com/api-keys\n2. Create a new API key\n3. Update OPENAI_API_KEY in your .env file\n4. Restart the backend server',
        type: error.constructor.name 
      });
    }
    
    res.status(500).json({ 
      error: 'Transcription failed', 
      details: error.message,
      type: error.constructor.name 
    });
  }
});

export default router;

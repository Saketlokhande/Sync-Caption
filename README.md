# SyncCapsule - AI Video Captioning Platform

A full-stack application that automatically generates and burns captions into videos using AI. Built with Next.js, Express, OpenAI Whisper/Gemini, and Remotion.

## 🚀 Features

- **Video Upload**: Support for MP4 uploads (max 30 seconds).
- **AI Captioning**: 
  - **Primary**: OpenAI Whisper API (High accuracy, word-level timestamps).
- **Dynamic Rendering**: Server-side video rendering using Remotion.
- **Styles**: Choose from 'Standard', 'News', or 'Karaoke' caption styles.
- **Hinglish Support**: Renders mixed Hindi/English text correctly.
- **Real-time Preview**: View captions and styling before rendering.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js
- **AI/ML**: OpenAI Whisper API
- **Video Processing**: Remotion, FFMPEG

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **FFMPEG**: Must be installed on your system (required for rendering)
- **API Keys**: OpenAI API Key

## ⚙️ Setup & Local Development

### 1. Clone the repository
```bash
git clone <repository-url>
cd SyncCapsule
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=8000
PORT=8000
OPENAI_API_KEY=sk-your_openai_key_here
```

Start the backend server:
```bash
npm run dev
```
Server runs at `http://localhost:8000`.

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
```

Start the frontend application:
```bash
npm run dev
```
App runs at `http://localhost:3000`.

## 🧠 Caption Generation Method

This project uses a flexible **API-based approach** for caption generation to ensure high accuracy and minimal server load.

### Solution Details
1.  **Upload**: The video file is uploaded to the backend `public/uploads` directory.
2.  **Transcription**: 
    - The backend reads the file and sends it to the **OpenAI Whisper API** (default).
    - **Model**: `whisper-1`
    - **Parameters**: `timestamp_granularities=['word']` is used to get precise start/end times for every word.
3.  **Processing**: The API response (JSON) is parsed to extract words and timestamps.
4.  **Rendering**: These timestamps are passed to the Remotion composition to overlay text at the exact right frames.

### Why API vs Local Model?
- **Accuracy**: Whisper-1 via API provides state-of-the-art accuracy, especially for mixed languages like Hinglish.
- **Performance**: Offloads heavy ML processing from your local/hosting server.
- **Speed**: Faster than running large local models on standard CPU instances.

## 🌍 Deployment

### Backend (Render / Railway / VPS)
The backend requires a runtime environment with **FFMPEG** installed.

**Deploying on Render:**
1.  Connect your repo to Render.
2.  Select "Web Service".
3.  Root Directory: `backend`
4.  Build Command: `npm install && npm run build`
5.  Start Command: `npm start`
6.  **Crucial Step**: Add an Environment Variable `ffmpeg` or use a Dockerfile to ensure FFMPEG is present.
    - *Alternative*: Use a Dockerfile deployment.

**Dockerfile for Backend:**
```dockerfile
FROM node:18-bullseye
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
```

### Frontend (Vercel / Netlify)
1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Root Directory: `frontend`
4.  Framework Preset: Next.js
5.  **Environment Variables**:
    - Update `lib/api.ts` in the frontend code to point to your deployed backend URL (e.g., `https://your-backend.onrender.com/api`) instead of `localhost`.

## 📝 Usage

1.  **Upload**: Select or drag & drop an MP4 video (max 30s).
2.  **Transcribe**: Click "Generate Captions" to send to Whisper API.
3.  **Style**: Select a caption style (Standard, News, Karaoke).
4.  **Preview**: Watch the video with generated captions.
5.  **Render**: Click "Render & Download" to process the final video.
6.  **Download**: Click the download button to open the final video in a new tab for saving.

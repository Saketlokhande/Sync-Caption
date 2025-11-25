"use client";

import React, { useState } from "react";
import {
  Type,
  Download,
  Wand2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import {
  uploadVideo,
  transcribeVideo,
  renderVideo,
  BrollSegment,
  PexelsVideo,
} from "../../lib/api";
import { RemotionPlayer } from "../../components/Player";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { FileUpload } from "../components/ui/FileUpload";
import { Jellyfish } from "../components/ui/Jellyfish";
import { PexelsSearch } from "../components/ui/PexelsSearch";
import { BrollEditor } from "../components/ui/BrollEditor";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:8000";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const [captions, setCaptions] = useState<any[]>([]);
  const [style, setStyle] = useState<"standard" | "news" | "karaoke">(
    "standard"
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 1080, height: 1920 });
  const [selectedPexelsVideo, setSelectedPexelsVideo] =
    useState<PexelsVideo | null>(null);
  const [brollSegments, setBrollSegments] = useState<BrollSegment[]>([]);
  const [renderedVideoFilename, setRenderedVideoFilename] =
    useState<string>("");

  const handleFileSelect = async (selectedFile: File) => {
    // Revoke previous video URL to prevent memory leaks
    if (videoUrl && videoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(videoUrl);
    }

    // Reset all state for new video
    setCaptions([]);
    setDownloadUrl("");
    setSelectedPexelsVideo(null);
    setBrollSegments([]);
    setRenderedVideoFilename("");
    setError("");
    setStatus("");

    // Set new file and create URL
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setVideoUrl(url);

    // Get video duration and dimensions
    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration);
      setVideoDimensions({
        width: video.videoWidth,
        height: video.videoHeight,
      });
      video.src = "";
    };

    // Upload immediately to get filename
    setLoading(true);
    setStatus("Uploading video...");
    try {
      const result = await uploadVideo(selectedFile);
      setFilename(result.filename);
      setStatus("Upload complete");
    } catch (error) {
      console.error(error);
      setError("Failed to upload video. Please try again.");
      setStatus("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribe = async () => {
    // Use rendered video filename if available (for re-transcription), otherwise use original filename
    const videoToTranscribe = renderedVideoFilename || filename;
    if (!videoToTranscribe) return;

    setLoading(true);
    setStatus("Generating captions...");
    setError("");
    try {
      const result = await transcribeVideo(videoToTranscribe);
      setCaptions(result.captions);
      setStatus("Transcription complete");
      // Clear rendered video filename after transcription so next render uses original
      if (renderedVideoFilename) {
        setRenderedVideoFilename("");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to transcribe video.");
      setStatus("Transcription failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRender = async () => {
    if (!filename || captions.length === 0) return;
    setLoading(true);
    setStatus("Rendering video...");
    setError("");
    try {
      const backendVideoUrl = `${BACKEND_BASE_URL}/uploads/${filename}`;
      const result = await renderVideo(
        backendVideoUrl,
        captions,
        style,
        videoDuration,
        videoDimensions,
        brollSegments.length > 0 ? brollSegments : undefined
      );
      setDownloadUrl(`${BACKEND_BASE_URL}${result.url}`);
      setRenderedVideoFilename(result.filename);
      setStatus("Render complete");
    } catch (error) {
      console.error(error);
      setError("Failed to render video.");
      setStatus("Rendering failed");
    } finally {
      setLoading(false);
    }
  };

  const scrollToApp = () => {
    document
      .getElementById("app-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "captioned-video.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to direct link
      window.open(url, "_blank");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Jellyfish-Inspired Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <Jellyfish
          top="10%"
          left="15%"
          width="300px"
          height="400px"
          opacity="opacity-30"
          bodySize="150px"
          bodyColor="linear-gradient(to bottom, rgba(34, 211, 238, 0.4), rgba(59, 130, 246, 0.2), transparent)"
          bodyAnimation="animate-jellyfish-1"
          tentacles={[
            {
              left: "50%",
              height: "200px",
              delay: "0s",
              animation: "animate-tentacle-1",
              color: "rgba(34, 211, 238, 0.3)",
            },
            {
              left: "45%",
              height: "180px",
              delay: "0.5s",
              animation: "animate-tentacle-2",
              color: "rgba(34, 211, 238, 0.25)",
            },
            {
              left: "55%",
              height: "190px",
              delay: "1s",
              animation: "animate-tentacle-1",
              color: "rgba(34, 211, 238, 0.25)",
            },
          ]}
        />

        <Jellyfish
          top="30%"
          right="10%"
          width="250px"
          height="350px"
          opacity="opacity-25"
          bodySize="120px"
          bodyColor="linear-gradient(to bottom, rgba(192, 132, 252, 0.4), rgba(244, 114, 182, 0.2), transparent)"
          bodyAnimation="animate-jellyfish-2"
          tentacles={[
            {
              left: "50%",
              height: "170px",
              delay: "0.3s",
              animation: "animate-tentacle-2",
              color: "rgba(192, 132, 252, 0.3)",
            },
            {
              left: "48%",
              height: "160px",
              delay: "0.8s",
              animation: "animate-tentacle-1",
              color: "rgba(244, 114, 182, 0.25)",
            },
            {
              left: "52%",
              height: "165px",
              delay: "1.3s",
              animation: "animate-tentacle-2",
              color: "rgba(192, 132, 252, 0.25)",
            },
          ]}
        />

        <Jellyfish
          top="70%"
          left="25%"
          width="200px"
          height="300px"
          opacity="opacity-20"
          bodySize="100px"
          bodyColor="linear-gradient(to bottom, rgba(52, 211, 153, 0.4), rgba(34, 197, 94, 0.2), transparent)"
          bodyAnimation="animate-jellyfish-3"
          tentacles={[
            {
              left: "50%",
              height: "150px",
              delay: "0.2s",
              animation: "animate-tentacle-1",
              color: "rgba(52, 211, 153, 0.3)",
            },
            {
              left: "47%",
              height: "140px",
              delay: "0.7s",
              animation: "animate-tentacle-2",
              color: "rgba(34, 197, 94, 0.25)",
            },
          ]}
        />

        <Jellyfish
          top="60%"
          right="30%"
          width="150px"
          height="250px"
          opacity="opacity-15"
          bodySize="80px"
          bodyColor="linear-gradient(to bottom, rgba(59, 130, 246, 0.4), rgba(34, 211, 238, 0.2), transparent)"
          bodyAnimation="animate-jellyfish-1"
          animationDelay="2s"
          tentacles={[
            {
              left: "50%",
              height: "120px",
              delay: "0.4s",
              animation: "animate-tentacle-2",
              color: "rgba(59, 130, 246, 0.3)",
            },
            {
              left: "48%",
              height: "110px",
              delay: "0.9s",
              animation: "animate-tentacle-1",
              color: "rgba(34, 211, 238, 0.25)",
            },
          ]}
        />

        {/* Ambient glow for depth */}
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] rounded-full bg-gradient-to-tl from-emerald-600/8 via-green-500/5 to-transparent blur-[120px]" />
        <div className="absolute top-0 left-0 w-[600px] h-[500px] rounded-full bg-gradient-to-br from-blue-600/8 via-cyan-500/4 to-transparent blur-[100px]" />
      </div>

      {/* Landing Section with Glass Effect */}
      <section className="h-screen flex flex-col items-center justify-center px-4 relative">
        {/* Glass overlay - reduced opacity for better jellyfish visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/3 to-black/10" />

        <div className="max-w-3xl mx-auto text-center space-y-5 relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
            SyncCapsule
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/90 max-w-xl mx-auto leading-relaxed">
            Transform your videos with professional, AI-generated captions in
            seconds. Upload, customize, and export with ease.
          </p>

          <button
            onClick={scrollToApp}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all duration-300 group"
          >
            <span className="text-sm font-medium">Get Started</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <ChevronDown className="w-6 h-6 text-white/30" />
        </div>
      </section>

      {/* App Section */}
      <section id="app-section" className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Controls */}
            <div className="lg:col-span-7 space-y-4">
              {/* Step 1: Upload */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                      1
                    </div>
                    Upload Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onError={(errorMsg) => {
                      setError(errorMsg);
                      setStatus("");
                    }}
                  />
                  {error && (
                    <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  {status && !error && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                      <p className="text-sm text-blue-400">{status}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 2: Search Pexels */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
                      2
                    </div>
                    Search Pexels Videos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PexelsSearch
                    onVideoSelect={(video) => setSelectedPexelsVideo(video)}
                    selectedVideoId={selectedPexelsVideo?.id}
                  />
                </CardContent>
              </Card>

              {/* Step 3: Add B-roll */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                      3
                    </div>
                    Add B-roll Segments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BrollEditor
                    brollSegments={brollSegments}
                    onSegmentsChange={setBrollSegments}
                    selectedVideo={selectedPexelsVideo}
                    onVideoSelect={setSelectedPexelsVideo}
                  />
                </CardContent>
              </Card>

              {/* Step 4: Transcribe */}
              <Card
                className={`border-white/10 bg-white/5 backdrop-blur-xl transition-opacity duration-300 ${
                  !filename ? "opacity-50 pointer-events-none" : "opacity-100"
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
                      4
                    </div>
                    Generate Captions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleTranscribe}
                    disabled={!filename || loading}
                    className="w-full h-10 text-sm"
                    isLoading={loading && status === "Generating captions..."}
                  >
                    {!loading && <Wand2 className="mr-2 w-4 h-4" />}
                    {loading && status === "Generating captions..."
                      ? "Transcribing..."
                      : renderedVideoFilename
                      ? "Re-transcribe Final Video"
                      : "Auto-Generate Captions"}
                  </Button>
                  {renderedVideoFilename && (
                    <p className="mt-2 text-xs text-muted-foreground text-center">
                      Will transcribe the rendered video with B-roll
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Step 5: Style */}
              <Card
                className={`border-white/10 bg-white/5 backdrop-blur-xl transition-opacity duration-300 ${
                  captions.length === 0
                    ? "opacity-50 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold">
                      5
                    </div>
                    Choose Style
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {["standard", "news", "karaoke"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStyle(s as any)}
                        className={`
                          relative group overflow-hidden rounded-lg p-3 border transition-all duration-300 text-sm backdrop-blur-md
                          ${
                            style === s
                              ? "bg-primary/20 border-primary shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)]"
                              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                          }
                        `}
                      >
                        <div className="relative z-10 flex flex-col items-center gap-1">
                          <span className="capitalize font-medium">{s}</span>
                          {style === s && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 6: Export */}
              <Card
                className={`border-white/10 bg-white/5 backdrop-blur-xl transition-opacity duration-300 ${
                  captions.length === 0
                    ? "opacity-50 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                      6
                    </div>
                    Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleRender}
                    disabled={!filename || captions.length === 0 || loading}
                    className="w-full h-10 text-sm"
                    isLoading={loading && status === "Rendering video..."}
                  >
                    {!loading && <Download className="mr-2 w-4 h-4" />}
                    {loading && status === "Rendering video..."
                      ? "Rendering..."
                      : "Render & Download"}
                  </Button>

                  {downloadUrl && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg backdrop-blur-md">
                      <p className="text-center text-green-400 mb-2 font-medium text-sm">
                        Video ready!
                      </p>
                      <button
                        onClick={() => {
                          const filename =
                            downloadUrl.split("/").pop() ||
                            "captioned-video.mp4";
                          handleDownload(downloadUrl, filename);
                        }}
                        className="block w-full text-center py-2 px-4 rounded-lg text-sm font-medium text-white transition-all duration-300 cursor-pointer"
                        style={{
                          background:
                            "linear-gradient(black, black) padding-box, linear-gradient(to right, #3b82f6, #a855f7, #ec4899) border-box",
                          border: "1px solid transparent",
                          boxShadow: "0 0 20px -5px rgba(59, 130, 246, 0.3)",
                        }}
                      >
                        Download MP4
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Preview */}
            <div className="lg:col-span-5">
              <div className="sticky top-8">
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
                  <div className="p-3 border-b border-white/5 bg-black/20 backdrop-blur-sm flex items-center justify-between">
                    <h2 className="font-medium text-xs text-muted-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Live Preview
                    </h2>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-muted-foreground backdrop-blur-sm">
                      {status || "Idle"}
                    </span>
                  </div>
                  <div className="p-1 bg-black">
                    {videoUrl ? (
                      <RemotionPlayer
                        videoUrl={videoUrl}
                        captions={captions}
                        style={style}
                        brollSegments={brollSegments}
                      />
                    ) : (
                      <div className="aspect-[9/16] w-full bg-secondary/20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm">
                          <Type className="w-6 h-6 opacity-50" />
                        </div>
                        <p className="text-sm">Upload a video to start</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

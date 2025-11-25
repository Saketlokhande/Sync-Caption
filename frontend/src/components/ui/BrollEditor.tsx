"use client";

import React, { useState } from "react";
import { Plus, Trash2, Clock, X } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { BrollSegment, PexelsVideo } from "../../../lib/api";

interface BrollEditorProps {
  brollSegments: BrollSegment[];
  onSegmentsChange: (segments: BrollSegment[]) => void;
  selectedVideo: PexelsVideo | null;
  onVideoSelect: (video: PexelsVideo | null) => void;
}

export const BrollEditor: React.FC<BrollEditorProps> = ({
  brollSegments,
  onSegmentsChange,
  selectedVideo,
  onVideoSelect,
}) => {
  const [startMinutes, setStartMinutes] = useState("");
  const [startSeconds, setStartSeconds] = useState("");
  const [endMinutes, setEndMinutes] = useState("");
  const [endSeconds, setEndSeconds] = useState("");

  const getBestVideoFile = (video: PexelsVideo) => {
    const hdFile = video.video_files.find((f) => f.quality === "hd");
    if (hdFile) return hdFile;
    return video.video_files[0];
  };

  const addSegment = () => {
    if (!selectedVideo) {
      alert("Please select a video from Pexels first");
      return;
    }

    const startMin = parseInt(startMinutes) || 0;
    const startSec = parseInt(startSeconds) || 0;
    const endMin = parseInt(endMinutes) || 0;
    const endSec = parseInt(endSeconds) || 0;

    const startTime = startMin * 60 + startSec;
    const endTime = endMin * 60 + endSec;

    if (startTime >= endTime) {
      alert("End time must be greater than start time");
      return;
    }

    const videoFile = getBestVideoFile(selectedVideo);
    if (!videoFile) {
      alert("No video file available");
      return;
    }

    const newSegment: BrollSegment = {
      videoUrl: videoFile.link,
      startMinutes: startMin,
      startSeconds: startSec,
      endMinutes: endMin,
      endSeconds: endSec,
    };

    // Check for overlapping segments
    const hasOverlap = brollSegments.some((seg) => {
      const segStart = seg.startMinutes * 60 + seg.startSeconds;
      const segEnd = seg.endMinutes * 60 + seg.endSeconds;
      return (
        (startTime >= segStart && startTime < segEnd) ||
        (endTime > segStart && endTime <= segEnd) ||
        (startTime <= segStart && endTime >= segEnd)
      );
    });

    if (hasOverlap) {
      alert("This time segment overlaps with an existing B-roll segment");
      return;
    }

    onSegmentsChange(
      [...brollSegments, newSegment].sort((a, b) => {
        const aStart = a.startMinutes * 60 + a.startSeconds;
        const bStart = b.startMinutes * 60 + b.startSeconds;
        return aStart - bStart;
      })
    );

    // Reset inputs
    setStartMinutes("");
    setStartSeconds("");
    setEndMinutes("");
    setEndSeconds("");
  };

  const removeSegment = (index: number) => {
    onSegmentsChange(brollSegments.filter((_, i) => i !== index));
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="w-5 h-5" />
          Add B-roll Segments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedVideo ? (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Selected Video</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVideoSelect(null)}
                className="h-6 px-2"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <img
                src={selectedVideo.image}
                alt="Selected video"
                className="w-16 h-10 object-cover rounded"
              />
              <div className="text-xs text-muted-foreground">
                Duration: {selectedVideo.duration}s
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-muted/10 border border-muted/20 rounded-lg text-sm text-muted-foreground text-center">
            Select a video from Pexels search to add B-roll segments
          </div>
        )}

        {selectedVideo && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Start Time
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="MM"
                      min="0"
                      value={startMinutes}
                      onChange={(e) => setStartMinutes(e.target.value)}
                      className="text-center"
                    />
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      Minutes
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    :
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="SS"
                      min="0"
                      max="59"
                      value={startSeconds}
                      onChange={(e) => setStartSeconds(e.target.value)}
                      className="text-center"
                    />
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      Seconds
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  End Time
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="MM"
                      min="0"
                      value={endMinutes}
                      onChange={(e) => setEndMinutes(e.target.value)}
                      className="text-center"
                    />
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      Minutes
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    :
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="SS"
                      min="0"
                      max="59"
                      value={endSeconds}
                      onChange={(e) => setEndSeconds(e.target.value)}
                      className="text-center"
                    />
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      Seconds
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={addSegment}
              disabled={!selectedVideo}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add B-roll Segment
            </Button>
          </div>
        )}

        {brollSegments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">B-roll Segments</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
              {brollSegments.map((segment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <div className="text-sm font-medium">
                        {formatTime(segment.startMinutes, segment.startSeconds)}{" "}
                        - {formatTime(segment.endMinutes, segment.endSeconds)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Duration:{" "}
                        {formatTime(
                          segment.endMinutes - segment.startMinutes,
                          segment.endSeconds - segment.startSeconds
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSegment(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

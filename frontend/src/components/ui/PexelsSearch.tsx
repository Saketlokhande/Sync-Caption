"use client";

import React, { useState, useCallback } from "react";
import { Search, Play, Loader2, X } from "lucide-react";
import { searchPexelsVideos, PexelsVideo } from "../../../lib/api";
import { Button } from "./Button";
import { Input } from "./Input";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";

interface PexelsSearchProps {
  onVideoSelect: (video: PexelsVideo) => void;
  selectedVideoId?: number;
}

export const PexelsSearch: React.FC<PexelsSearchProps> = ({
  onVideoSelect,
  selectedVideoId,
}) => {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<PexelsVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError("");
    setPage(1);

    try {
      const result = await searchPexelsVideos(query, 1, 15);
      setVideos(result.videos);
      setHasMore(!!result.next_page);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.response?.data?.error || "Failed to search videos");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleLoadMore = useCallback(async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    try {
      const result = await searchPexelsVideos(query, page + 1, 15);
      setVideos((prev) => [...prev, ...result.videos]);
      setHasMore(!!result.next_page);
      setPage((p) => p + 1);
    } catch (err: any) {
      console.error("Load more error:", err);
      setError(err.response?.data?.error || "Failed to load more videos");
    } finally {
      setLoading(false);
    }
  }, [query, page, loading]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getBestVideoFile = (video: PexelsVideo) => {
    // Prefer HD quality, fallback to highest quality available
    const hdFile = video.video_files.find((f) => f.quality === "hd");
    if (hdFile) return hdFile;
    return video.video_files[0];
  };

  return (
    <div className="space-y-4">
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="w-5 h-5" />
            Search Pexels Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for videos (e.g., nature, city, technology)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              isLoading={loading}
            >
              {!loading && <Search className="w-4 h-4 mr-2" />}
              Search
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {videos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Search Results ({videos.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
            {videos.map((video) => {
              const videoFile = getBestVideoFile(video);
              const isSelected = selectedVideoId === video.id;

              return (
                <div
                  key={video.id}
                  className={`group relative rounded-lg overflow-hidden border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/50 bg-primary/10"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                  onClick={() => onVideoSelect(video)}
                >
                  <div className="aspect-video relative bg-black">
                    <img
                      src={video.image}
                      alt={`Video ${video.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Play className="w-8 h-8 text-white opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{video.duration}s</span>
                      <span>
                        {video.width}×{video.height}
                      </span>
                    </div>
                    {videoFile && (
                      <div className="text-xs text-muted-foreground">
                        Quality: {videoFile.quality.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              isLoading={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};



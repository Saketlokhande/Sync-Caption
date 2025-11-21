'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { CaptionedVideo } from '../remotion/VideoComponent';

interface PlayerProps {
  videoUrl: string;
  captions: any[];
  style: 'standard' | 'news' | 'karaoke';
}

export const RemotionPlayer: React.FC<PlayerProps> = ({ videoUrl, captions, style }) => {
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({
    width: 1080,
    height: 1920,
  });
  const [isLandscape, setIsLandscape] = useState(false);
  const [videoDuration, setVideoDuration] = useState(300); // Default 10 seconds in frames

  useEffect(() => {
    if (!videoUrl) return;

    const video = document.createElement('video');
    video.src = videoUrl;
    
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const durationInSeconds = video.duration;
      
      setVideoDimensions({ width, height });
      setIsLandscape(width > height);
      // Convert duration to frames (30 fps)
      setVideoDuration(Math.ceil(durationInSeconds * 30));
      
      // Clean up
      video.src = '';
    };
  }, [videoUrl]);

  const aspectRatio = isLandscape ? '16/9' : '9/16';
  const maxWidth = isLandscape ? '640px' : '360px';

  return (
    <div 
      className="w-full mx-auto border rounded-lg overflow-hidden shadow-lg bg-black"
      style={{
        aspectRatio,
        maxWidth,
      }}
    >
      <Player
        component={CaptionedVideo}
        inputProps={{
          videoUrl,
          captions,
          style,
        }}
        durationInFrames={videoDuration}
        compositionWidth={videoDimensions.width}
        compositionHeight={videoDimensions.height}
        fps={30}
        style={{
          width: '100%',
          height: '100%',
        }}
        controls
      />
    </div>
  );
};

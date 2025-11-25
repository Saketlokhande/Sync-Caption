import React from 'react';
import { AbsoluteFill, Video, Audio, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import { loadFont } from "@remotion/google-fonts/NotoSans";
import { loadFont as loadDevanagari } from "@remotion/google-fonts/NotoSansDevanagari";

const { fontFamily } = loadFont();
const { fontFamily: devanagariFamily } = loadDevanagari();

interface Caption {
  text: string;
  start: number;
  end: number;
}

interface BrollSegment {
  videoUrl: string;
  startMinutes: number;
  startSeconds: number;
  endMinutes: number;
  endSeconds: number;
}

export type CaptionedVideoProps = {
  videoUrl: string;
  captions: Caption[];
  style: 'standard' | 'news' | 'karaoke';
  brollSegments?: BrollSegment[];
};

export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({ 
  videoUrl, 
  captions, 
  style,
  brollSegments = []
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps * 1000; // in ms
  const currentTimeSeconds = frame / fps; // in seconds

  // Find if current time is within a B-roll segment
  const currentBrollSegment = brollSegments?.find((segment) => {
    const segmentStart = segment.startMinutes * 60 + segment.startSeconds;
    const segmentEnd = segment.endMinutes * 60 + segment.endSeconds;
    return currentTimeSeconds >= segmentStart && currentTimeSeconds < segmentEnd;
  });

  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime <= c.end
  );

  // Convert B-roll segments to frames for Sequence components
  const brollSequences = (brollSegments || []).map((segment, index) => {
    const startSeconds = segment.startMinutes * 60 + segment.startSeconds;
    const endSeconds = segment.endMinutes * 60 + segment.endSeconds;
    const durationSeconds = endSeconds - startSeconds;
    
    return {
      ...segment,
      startFrame: Math.floor(startSeconds * fps),
      durationInFrames: Math.ceil(durationSeconds * fps),
    };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* Original video - always plays (for audio), but hidden during B-roll */}
      {videoUrl && (
        <Video 
          src={videoUrl} 
          style={{ 
            opacity: currentBrollSegment ? 0 : 1,
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        />
      )}

      {/* B-roll segments - muted so original audio continues */}
      {brollSequences.map((seq, index) => (
        <Sequence
          key={index}
          from={seq.startFrame}
          durationInFrames={seq.durationInFrames}
        >
          <Video src={seq.videoUrl} volume={0} />
        </Sequence>
      ))}
      
      {/* Captions overlay */}
      {currentCaption && (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 100 }}>
            {style === 'standard' && (
                 <div style={{
                    fontFamily: `${fontFamily}, ${devanagariFamily}, sans-serif`,
                    fontSize: 60,
                    color: 'white',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    textAlign: 'center',
                    padding: '20px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '10px',
                    maxWidth: '80%'
                  }}>
                    {currentCaption.text}
                  </div>
            )}
             {style === 'news' && (
                 <div style={{
                    position: 'absolute',
                    top: 50,
                    left: 0,
                    right: 0,
                    fontFamily: `${fontFamily}, ${devanagariFamily}, sans-serif`,
                    fontSize: 50,
                    color: 'black',
                    backgroundColor: 'white',
                    padding: '20px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    {currentCaption.text}
                  </div>
            )}
             {style === 'karaoke' && (
                 <div style={{
                    fontFamily: `${fontFamily}, ${devanagariFamily}, sans-serif`,
                    fontSize: 70,
                    color: '#ff00ff',
                    textShadow: '3px 3px 0px #000',
                    textAlign: 'center',
                    fontWeight: '900'
                  }}>
                    {currentCaption.text}
                  </div>
            )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

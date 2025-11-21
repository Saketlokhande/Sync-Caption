import React from 'react';
// Force update
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from "@remotion/google-fonts/NotoSans";
import { loadFont as loadDevanagari } from "@remotion/google-fonts/NotoSansDevanagari";

const { fontFamily } = loadFont();
const { fontFamily: devanagariFamily } = loadDevanagari();

interface Caption {
  text: string;
  start: number;
  end: number;
}

export type CaptionedVideoProps = {
  videoUrl: string;
  captions: Caption[];
  style: 'standard' | 'news' | 'karaoke';
};

export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({ videoUrl, captions, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps * 1000; // in ms

  const currentCaption = captions.find(
    (c) => currentTime >= c.start && currentTime <= c.end
  );

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {videoUrl && <Video src={videoUrl} />}
      
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

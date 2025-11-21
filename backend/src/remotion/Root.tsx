import React from 'react';
import { Composition } from 'remotion';
import { CaptionedVideo, CaptionedVideoProps } from './CaptionedVideo';
import './style.css'; // We'll need some basic CSS

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo as any}
        durationInFrames={300} // Default, will be overridden
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
            videoUrl: '',
            captions: [],
            style: 'standard'
        }}
      />
    </>
  );
};

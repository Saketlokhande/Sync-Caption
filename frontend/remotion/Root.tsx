import React from 'react';
import { Composition } from 'remotion';
import { CaptionedVideo, CaptionedVideoProps } from './VideoComponent';
import './style.css';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition<any, CaptionedVideoProps>
        id="CaptionedVideo"
        component={CaptionedVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
            videoUrl: '',
            captions: [],
            style: 'standard',
            brollSegments: []
        }}
      />
    </>
  );
};

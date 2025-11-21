import React from 'react';

interface TentacleProps {
  left: string;
  height: string;
  delay: string;
  animation: 'animate-tentacle-1' | 'animate-tentacle-2';
  color: string;
  topOffset: string;
}

const Tentacle: React.FC<TentacleProps> = ({ left, height, delay, animation, color, topOffset }) => (
  <div
    className={`absolute w-[2px] bg-gradient-to-b to-transparent blur-[2px] ${animation}`}
    style={{ 
      left, 
      top: topOffset,
      height,
      animationDelay: delay,
      backgroundImage: `linear-gradient(to bottom, ${color}, transparent)`
    }}
  />
);

interface JellyfishProps {
  top: string;
  left?: string;
  right?: string;
  width: string;
  height: string;
  opacity: string;
  bodySize: string;
  bodyColor: string;
  bodyAnimation: 'animate-jellyfish-1' | 'animate-jellyfish-2' | 'animate-jellyfish-3';
  tentacles: Array<{
    left: string;
    height: string;
    delay: string;
    animation: 'animate-tentacle-1' | 'animate-tentacle-2';
    color: string;
  }>;
  animationDelay?: string;
}

export const Jellyfish: React.FC<JellyfishProps> = ({
  top,
  left,
  right,
  width,
  height,
  opacity,
  bodySize,
  bodyColor,
  bodyAnimation,
  tentacles,
  animationDelay = '0s',
}) => {
  const positionStyle = left ? { left } : { right };
  const bodySizeNum = parseInt(bodySize);
  const tentacleTopOffset = `${bodySizeNum * 0.67}px`; // Position tentacles below body
  
  return (
    <div 
      className={`absolute ${opacity}`}
      style={{ top, width, height, ...positionStyle }}
    >
      <div className="relative w-full h-full">
        {/* Jellyfish body */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b to-transparent ${bodyAnimation}`}
          style={{
            width: bodySize,
            height: bodySize,
            backgroundImage: bodyColor,
            filter: `blur(${bodySizeNum / 4}px)`,
            animationDelay,
          }}
        />
        
        {/* Tentacles */}
        {tentacles.map((tentacle, index) => (
          <Tentacle key={index} {...tentacle} topOffset={tentacleTopOffset} />
        ))}
      </div>
    </div>
  );
};

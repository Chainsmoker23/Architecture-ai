import React, { useState, useEffect } from 'react';

interface MagicalTextProps {
  text: string;
  onAnimationComplete?: () => void;
}

const MagicalText: React.FC<MagicalTextProps> = ({ text, onAnimationComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  // Character set for scrambling effect. Using a mix of symbols and spaces for visual variety.
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  useEffect(() => {
    let frame = 0;
    const frameRate = 30; // Update every 30ms for a smooth animation
    // Adjust total duration based on text length to feel natural
    const totalDuration = text.length * 40; 
    const totalFrames = Math.max(1, totalDuration / frameRate);

    const intervalId = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const revealCount = Math.floor(text.length * progress);
      
      let output = text.substring(0, revealCount);

      // Scramble the remaining characters
      for (let i = revealCount; i < text.length; i++) {
        // Use a space character part of the time for a less dense scramble
        if (Math.random() < 0.25) {
            output += ' ';
        } else {
            output += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      setDisplayedText(output);

      if (frame >= totalFrames) {
        setDisplayedText(text); // Ensure final text is correct
        clearInterval(intervalId);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    }, frameRate);

    return () => clearInterval(intervalId);
  }, [text, onAnimationComplete]);

  return (
    <div className="magical-text-gradient font-medium" style={{ fontFamily: "'Fira Code', monospace" }}>
      {displayedText}
    </div>
  );
};

export default MagicalText;
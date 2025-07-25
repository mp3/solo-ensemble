import { useState, useEffect, useRef } from 'react';

export const useLevelMeter = (analyser: AnalyserNode | null) => {
  const [level, setLevel] = useState(0);
  const animationFrame = useRef<number>();

  useEffect(() => {
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate RMS
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += (dataArray[i]! / 255) ** 2;
      }
      const rms = Math.sqrt(sum / bufferLength);
      
      setLevel(rms);
      animationFrame.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [analyser]);

  return level;
};
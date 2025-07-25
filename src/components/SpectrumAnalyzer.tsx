import React, { useRef, useEffect } from 'react';

interface SpectrumAnalyzerProps {
  analyser: AnalyserNode | null;
  width?: number;
  height?: number;
}

export const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({
  analyser,
  width = 400,
  height = 100
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(45, 45, 45)';
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i]! / 255) * height;

        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, 'rgb(76, 175, 80)');
        gradient.addColorStop(0.5, 'rgb(255, 235, 59)');
        gradient.addColorStop(1, 'rgb(244, 67, 54)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, width, height]);

  return (
    <div className="bg-surface p-4 rounded-lg">
      <h3 className="text-text-secondary text-sm mb-2">Spectrum</h3>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full rounded"
      />
    </div>
  );
};
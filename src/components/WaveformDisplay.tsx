import React, { useRef, useEffect } from 'react';

interface WaveformDisplayProps {
  analyser: AnalyserNode | null;
  width?: number;
  height?: number;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
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

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgb(45, 45, 45)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(33, 150, 243)';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i]! / 128.0;
        const y = v * height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
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
      <h3 className="text-text-secondary text-sm mb-2">Waveform</h3>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full rounded"
      />
    </div>
  );
};
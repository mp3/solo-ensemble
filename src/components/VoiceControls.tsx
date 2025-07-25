import React from 'react';

interface VoiceControlsProps {
  voiceName: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
  color: string;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  voiceName,
  volume,
  onVolumeChange,
  color
}) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-surface rounded">
      <span className={`font-medium capitalize ${color}`}>{voiceName}</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, currentColor ${volume * 100}%, rgb(75 85 99) ${volume * 100}%)`
        }}
      />
      <span className="text-sm text-text-secondary w-12 text-right">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
};
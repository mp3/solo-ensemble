import React from 'react';

interface AudioControlsProps {
  isAudioStarted: boolean;
  onStartAudio: () => void;
  latency: number;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isAudioStarted,
  onStartAudio,
  latency
}) => {
  return (
    <div className="flex items-center gap-5 justify-center my-5">
      <button 
        className="bg-primary text-white border-none px-6 py-3 text-base rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
        onClick={onStartAudio}
        disabled={isAudioStarted}
      >
        {isAudioStarted ? 'Audio Started' : 'Start Audio'}
      </button>
      
      <div className="bg-surface px-4 py-2 rounded font-mono">
        Latency: {latency > 0 ? `${latency.toFixed(1)} ms` : '-- ms'}
      </div>
    </div>
  );
};
import React from 'react';
import { MetronomeState } from '../hooks/useMetronome';

interface MetronomeControlsProps {
  metronomeState: MetronomeState;
  onToggle: () => void;
  onBpmChange: (bpm: number) => void;
  disabled?: boolean;
}

export const MetronomeControls: React.FC<MetronomeControlsProps> = ({
  metronomeState,
  onToggle,
  onBpmChange,
  disabled = false
}) => {
  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bpm = parseInt(e.target.value);
    if (!isNaN(bpm) && bpm >= 40 && bpm <= 300) {
      onBpmChange(bpm);
    }
  };

  return (
    <div className="bg-surface p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-secondary font-medium">Metronome</h3>
        <button
          onClick={onToggle}
          disabled={disabled}
          className={`px-4 py-2 rounded text-sm font-medium transition-all ${
            metronomeState.isPlaying
              ? 'bg-error hover:bg-red-600 text-white'
              : 'bg-primary hover:bg-blue-600 text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {metronomeState.isPlaying ? 'Stop' : 'Start'}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-text-secondary">BPM:</label>
        <input
          type="range"
          min="40"
          max="300"
          value={metronomeState.bpm}
          onChange={handleBpmChange}
          disabled={disabled}
          className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm font-mono w-12 text-right">{metronomeState.bpm}</span>
      </div>

      {metronomeState.isPlaying && (
        <div className="flex gap-2 mt-3 justify-center">
          {Array.from({ length: metronomeState.beatsPerBar }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i + 1 === metronomeState.currentBeat
                  ? 'bg-primary scale-125'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
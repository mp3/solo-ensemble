import React from 'react';
import { LoopState } from '../types';

interface RecorderControlsProps {
  loopState: LoopState;
  onRecord: () => void;
  onPlay: () => void;
  onStop: () => void;
  onClear: () => void;
}

export const RecorderControls: React.FC<RecorderControlsProps> = ({
  loopState,
  onRecord,
  onPlay,
  onStop,
  onClear
}) => {
  return (
    <div className="flex gap-2.5 justify-center items-center flex-wrap my-5">
      <button 
        className={`px-5 py-2.5 border-none rounded text-sm transition-all ${
          loopState.isRecording 
            ? 'bg-error animate-pulse' 
            : 'bg-secondary hover:bg-orange-700'
        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        onClick={onRecord}
        disabled={loopState.isPlaying}
      >
        Record
      </button>
      
      <button 
        className="px-5 py-2.5 border-none rounded text-sm bg-success hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        onClick={onPlay}
        disabled={loopState.isRecording || loopState.isPlaying}
      >
        Play
      </button>
      
      <button 
        className="px-5 py-2.5 border-none rounded text-sm bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        onClick={onStop}
        disabled={!loopState.isPlaying}
      >
        Stop
      </button>
      
      <button 
        className="px-5 py-2.5 border-none rounded text-sm bg-gray-700 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        onClick={onClear}
        disabled={loopState.isRecording || loopState.isPlaying}
      >
        Clear
      </button>
      
      <div className="bg-surface px-4 py-2 rounded font-mono">
        <span>Loop: </span>
        <span>{loopState.currentBar}</span>
        <span> / {loopState.totalBars} bars @ {loopState.bpm} BPM</span>
      </div>
    </div>
  );
};
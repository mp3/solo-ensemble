import React from 'react';
import { NoteInfo } from '../types';

interface PitchDisplayProps {
  note: NoteInfo | null;
  confidence: number;
}

export const PitchDisplay: React.FC<PitchDisplayProps> = ({ note, confidence }) => {
  return (
    <div className="bg-surface p-5 rounded-lg text-center my-5">
      <div className="flex flex-col items-center gap-2.5">
        <span className="text-text-secondary font-medium">Detected Note:</span>
        <span className="text-5xl font-bold text-primary">
          {note ? `${note.note}${note.octave}` : '--'}
        </span>
        <div className="w-[200px] h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-success transition-all duration-100" 
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
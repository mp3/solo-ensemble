import React from 'react';
import { Track } from '../types';

interface TrackListProps {
  tracks: Track[];
}

export const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  return (
    <div className="bg-surface p-5 rounded-lg">
      <div className="text-text-secondary font-medium mb-2.5">Recorded Tracks:</div>
      <div className="grid gap-2.5">
        {tracks.length === 0 ? (
          <div className="text-text-secondary text-center py-4">No tracks recorded yet</div>
        ) : (
          tracks.map((track, index) => (
            <div key={track.id} className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded">
              <span className="font-bold text-primary">{index + 1}</span>
              <span>{track.name}</span>
              <span className="ml-auto text-sm text-text-secondary">Ready</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
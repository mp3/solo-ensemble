import React from 'react';
import { Track } from '../types';

interface TrackListProps {
  tracks: Track[];
  mutedTracks?: Set<string>;
  soloedTracks?: Set<string>;
  onToggleMute?: (trackId: string) => void;
  onToggleSolo?: (trackId: string) => void;
}

export const TrackList: React.FC<TrackListProps> = ({ 
  tracks,
  mutedTracks = new Set(),
  soloedTracks = new Set(),
  onToggleMute,
  onToggleSolo
}) => {
  const hasSoloedTracks = soloedTracks.size > 0;

  const isTrackAudible = (trackId: string) => {
    if (hasSoloedTracks) {
      return soloedTracks.has(trackId);
    }
    return !mutedTracks.has(trackId);
  };

  return (
    <div className="bg-surface p-5 rounded-lg">
      <div className="text-text-secondary font-medium mb-2.5">Recorded Tracks:</div>
      <div className="grid gap-2.5">
        {tracks.length === 0 ? (
          <div className="text-text-secondary text-center py-4">No tracks recorded yet</div>
        ) : (
          tracks.map((track, index) => (
            <div 
              key={track.id} 
              className={`flex items-center gap-2.5 p-2.5 rounded transition-all ${
                isTrackAudible(track.id) ? 'bg-white/5' : 'bg-black/20 opacity-50'
              }`}
            >
              <span className="font-bold text-primary">{index + 1}</span>
              <span className="flex-1">{track.name}</span>
              
              {onToggleMute && onToggleSolo && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onToggleSolo(track.id)}
                    className={`px-3 py-1 text-xs rounded font-medium transition-all ${
                      soloedTracks.has(track.id)
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                    }`}
                  >
                    S
                  </button>
                  <button
                    onClick={() => onToggleMute(track.id)}
                    disabled={soloedTracks.has(track.id)}
                    className={`px-3 py-1 text-xs rounded font-medium transition-all ${
                      mutedTracks.has(track.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                    } ${soloedTracks.has(track.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    M
                  </button>
                </div>
              )}
              
              <span className="text-sm text-text-secondary">Ready</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
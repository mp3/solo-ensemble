import React from 'react';
import { Track } from '../types';

interface TrackListProps {
  tracks: Track[];
  mutedTracks?: Set<string>;
  soloedTracks?: Set<string>;
  onToggleMute?: (trackId: string) => void;
  onToggleSolo?: (trackId: string) => void;
  onDeleteTrack?: (trackId: string) => void;
}

export const TrackList: React.FC<TrackListProps> = ({ 
  tracks,
  mutedTracks = new Set(),
  soloedTracks = new Set(),
  onToggleMute,
  onToggleSolo,
  onDeleteTrack
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
              
              {onDeleteTrack && (
                <button
                  onClick={() => onDeleteTrack(track.id)}
                  className="p-1 rounded hover:bg-red-600 transition-all"
                  title="Delete track"
                >
                  <svg
                    className="w-4 h-4 text-gray-400 hover:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
              
              <span className="text-sm text-text-secondary">Ready</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
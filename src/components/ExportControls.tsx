import React, { useState } from 'react';
import { Track } from '../types';
import { exportToWav, mixTracks, downloadAudio } from '../utils/audioExport';

interface ExportControlsProps {
  tracks: Track[];
  disabled?: boolean;
}

export const ExportControls: React.FC<ExportControlsProps> = ({ tracks, disabled = false }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'individual' | 'mixed'>('mixed');

  const handleExport = async () => {
    if (tracks.length === 0) return;

    setIsExporting(true);
    try {
      if (exportFormat === 'mixed') {
        // Mix all tracks into one
        const buffers = tracks.map(t => t.audioBuffer);
        const mixedBuffer = await mixTracks(buffers);
        const wavBlob = exportToWav(mixedBuffer);
        downloadAudio(wavBlob, `solo-ensemble-mix-${Date.now()}.wav`);
      } else {
        // Export each track individually
        tracks.forEach((track, index) => {
          const wavBlob = exportToWav(track.audioBuffer);
          downloadAudio(wavBlob, `track-${index + 1}-${track.name}.wav`);
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export audio. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-surface p-5 rounded-lg">
      <h3 className="text-text-secondary font-medium mb-3">Export Options</h3>
      
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="exportFormat"
            value="mixed"
            checked={exportFormat === 'mixed'}
            onChange={(e) => setExportFormat(e.target.value as 'individual' | 'mixed')}
            className="text-primary"
          />
          <span className="text-sm">Mixed (all tracks)</span>
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="exportFormat"
            value="individual"
            checked={exportFormat === 'individual'}
            onChange={(e) => setExportFormat(e.target.value as 'individual' | 'mixed')}
            className="text-primary"
          />
          <span className="text-sm">Individual tracks</span>
        </label>
      </div>

      <button
        onClick={handleExport}
        disabled={disabled || tracks.length === 0 || isExporting}
        className={`w-full px-4 py-2 rounded font-medium transition-all ${
          disabled || tracks.length === 0 || isExporting
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-primary hover:bg-blue-600 text-white'
        }`}
      >
        {isExporting ? 'Exporting...' : 'Export to WAV'}
      </button>
      
      {tracks.length === 0 && (
        <p className="text-text-secondary text-sm mt-2 text-center">
          No tracks to export yet
        </p>
      )}
    </div>
  );
};
import React from 'react';
import { Scale, VoicingType, HarmonySettings } from '../types';

interface HarmonyControlsProps {
  settings: HarmonySettings;
  onSettingsChange: (settings: HarmonySettings) => void;
}

const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const HarmonyControls: React.FC<HarmonyControlsProps> = ({
  settings,
  onSettingsChange
}) => {
  const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ ...settings, key: e.target.value });
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ ...settings, scale: e.target.value as Scale });
  };

  const handleVoicingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ ...settings, voicing: e.target.value as VoicingType });
  };

  return (
    <div className="flex gap-5 justify-center flex-wrap my-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="key-select" className="text-text-secondary text-sm">Key:</label>
        <select 
          id="key-select" 
          value={settings.key} 
          onChange={handleKeyChange}
          className="bg-surface text-text border border-white/20 px-3 py-2 rounded text-sm"
        >
          {keys.map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="scale-select" className="text-text-secondary text-sm">Scale:</label>
        <select 
          id="scale-select" 
          value={settings.scale} 
          onChange={handleScaleChange}
          className="bg-surface text-text border border-white/20 px-3 py-2 rounded text-sm"
        >
          <option value="major">Major</option>
          <option value="minor">Minor</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="voicing-select" className="text-text-secondary text-sm">Voicing:</label>
        <select 
          id="voicing-select" 
          value={settings.voicing} 
          onChange={handleVoicingChange}
          className="bg-surface text-text border border-white/20 px-3 py-2 rounded text-sm"
        >
          <option value="triad">Triad</option>
          <option value="satb">SATB</option>
          <option value="close">Close Harmony</option>
          <option value="open">Open Harmony</option>
        </select>
      </div>
    </div>
  );
};
import React from 'react';
import { SynthesizerSettings } from '../hooks/useFormantSynthesizer';

interface SynthesizerControlsProps {
  settings: SynthesizerSettings;
  onVowelChange: (vowel: string) => void;
  onToggleFormants: () => void;
}

const VOWELS = [
  { value: 'a', label: 'A' },
  { value: 'e', label: 'E' },
  { value: 'i', label: 'I' },
  { value: 'o', label: 'O' },
  { value: 'u', label: 'U' },
  { value: 'ah', label: 'AH' }
];

export const SynthesizerControls: React.FC<SynthesizerControlsProps> = ({
  settings,
  onVowelChange,
  onToggleFormants
}) => {
  return (
    <div className="bg-surface p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-secondary font-medium">Voice Synthesis</h3>
        <button
          onClick={onToggleFormants}
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
            settings.useFormants
              ? 'bg-primary text-white'
              : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
        >
          {settings.useFormants ? 'Formant' : 'Simple'}
        </button>
      </div>

      {settings.useFormants && (
        <div>
          <label className="block text-sm text-text-secondary mb-2">Vowel Sound</label>
          <div className="grid grid-cols-3 gap-2">
            {VOWELS.map(vowel => (
              <button
                key={vowel.value}
                onClick={() => onVowelChange(vowel.value)}
                className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                  settings.vowel === vowel.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                }`}
              >
                {vowel.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-text-secondary">
        {settings.useFormants
          ? 'Using formant synthesis for more natural voice sound'
          : 'Using simple oscillators for basic synthesis'}
      </div>
    </div>
  );
};
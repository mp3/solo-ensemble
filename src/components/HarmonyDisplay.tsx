import React from 'react';
import { HarmonyVoice } from '../types';

interface HarmonyDisplayProps {
  harmony: HarmonyVoice[];
}

export const HarmonyDisplay: React.FC<HarmonyDisplayProps> = ({ harmony }) => {
  const voiceOrder = ['soprano', 'alto', 'tenor', 'bass'] as const;
  
  return (
    <div className="bg-surface p-5 rounded-lg text-center my-5">
      <div className="text-text-secondary font-medium mb-2.5">Harmony Notes:</div>
      <div className="flex justify-center gap-5 mt-2.5">
        {voiceOrder.map(voiceName => {
          const voice = harmony.find(v => v.name === voiceName);
          return (
            <span 
              key={voiceName} 
              className={`text-2xl font-bold px-4 py-2.5 bg-white/10 rounded min-w-[50px] ${
                voiceName === 'soprano' ? 'text-yellow-400' :
                voiceName === 'alto' ? 'text-pink-400' :
                voiceName === 'tenor' ? 'text-sky-300' :
                'text-green-300'
              }`} 
              data-voice={voiceName}
            >
              {voice ? voice.note : '--'}
            </span>
          );
        })}
      </div>
    </div>
  );
};
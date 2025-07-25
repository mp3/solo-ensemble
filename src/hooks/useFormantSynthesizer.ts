import { useRef, useCallback, useState } from 'react';
import { HarmonyVoice } from '../types';
import { FormantSynthesizer } from '../utils/formantSynthesis';

interface VoiceNode {
  synthesizer: FormantSynthesizer;
  voiceType: 'soprano' | 'alto' | 'tenor' | 'bass';
}

export interface VoiceVolumes {
  soprano: number;
  alto: number;
  tenor: number;
  bass: number;
}

export interface SynthesizerSettings {
  useFormants: boolean;
  vowel: string;
}

export const useFormantSynthesizer = (
  audioContext: AudioContext | null, 
  outputGain: GainNode | null,
  initialVolumes?: VoiceVolumes,
  initialUseFormants?: boolean,
  initialVowel?: string
) => {
  const voiceNodes = useRef<Map<string, VoiceNode>>(new Map());
  const [voiceVolumes, setVoiceVolumes] = useState<VoiceVolumes>(initialVolumes || {
    soprano: 0.25,
    alto: 0.25,
    tenor: 0.25,
    bass: 0.25
  });

  const [synthSettings, setSynthSettings] = useState<SynthesizerSettings>({
    useFormants: initialUseFormants ?? true,
    vowel: initialVowel || 'ah'
  });

  const synthesizeVoices = useCallback((harmony: HarmonyVoice[]) => {
    if (!audioContext || !outputGain) return;

    // Stop existing synthesizers
    voiceNodes.current.forEach(node => {
      node.synthesizer.stop();
      node.synthesizer.disconnect();
    });
    voiceNodes.current.clear();

    // Create new synthesizers for each voice
    harmony.forEach(voice => {
      const synthesizer = new FormantSynthesizer(audioContext);
      synthesizer.connect(outputGain);

      // Apply individual voice volume
      const volume = voiceVolumes[voice.name];
      
      // Synthesize with formants
      synthesizer.synthesizeVowel(
        voice.frequency,
        synthSettings.vowel,
        voice.name,
        volume
      );

      voiceNodes.current.set(voice.name, { 
        synthesizer, 
        voiceType: voice.name 
      });
    });
  }, [audioContext, outputGain, voiceVolumes, synthSettings]);

  const setVoiceVolume = useCallback((voiceName: keyof VoiceVolumes, volume: number) => {
    setVoiceVolumes(prev => ({ ...prev, [voiceName]: volume }));
    
    // Update volume for currently playing voice
    const node = voiceNodes.current.get(voiceName);
    if (node && audioContext) {
      // Re-synthesize with new volume
      const currentVoice = Array.from(voiceNodes.current.entries())
        .find(([name]) => name === voiceName);
      
      if (currentVoice) {
        node.synthesizer.synthesizeVowel(
          440, // This should be the current frequency
          synthSettings.vowel,
          voiceName,
          volume
        );
      }
    }
  }, [audioContext, synthSettings.vowel]);

  const stopAllVoices = useCallback(() => {
    voiceNodes.current.forEach(node => {
      node.synthesizer.stop();
      node.synthesizer.disconnect();
    });
    voiceNodes.current.clear();
  }, []);

  const setVowel = useCallback((vowel: string) => {
    setSynthSettings(prev => ({ ...prev, vowel }));
  }, []);

  const toggleFormants = useCallback(() => {
    setSynthSettings(prev => ({ ...prev, useFormants: !prev.useFormants }));
  }, []);

  return { 
    synthesizeVoices, 
    stopAllVoices, 
    voiceVolumes, 
    setVoiceVolume,
    synthSettings,
    setVowel,
    toggleFormants
  };
};
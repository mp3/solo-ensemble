import { useRef, useCallback, useState } from 'react';
import { HarmonyVoice } from '../types';
import { FormantSynthesizer } from '../utils/formantSynthesis';

interface VoiceNode {
  synthesizer?: FormantSynthesizer;
  oscillator?: OscillatorNode;
  gain?: GainNode;
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
    useFormants: initialUseFormants ?? false,  // Default to simple mode
    vowel: initialVowel || 'ah'
  });

  const synthesizeVoices = useCallback((harmony: HarmonyVoice[]) => {
    if (!audioContext || !outputGain) return;

    // Stop existing synthesizers
    voiceNodes.current.forEach(node => {
      if (node.synthesizer) {
        node.synthesizer.stop();
        node.synthesizer.disconnect();
      }
      if (node.oscillator) {
        node.oscillator.stop();
        node.oscillator.disconnect();
      }
      if (node.gain) {
        node.gain.disconnect();
      }
    });
    voiceNodes.current.clear();

    // Create new synthesizers for each voice
    harmony.forEach(voice => {
      const volume = voiceVolumes[voice.name];
      
      if (synthSettings.useFormants) {
        // Use formant synthesis
        const synthesizer = new FormantSynthesizer(audioContext);
        synthesizer.connect(outputGain);
        
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
      } else {
        // Use simple oscillator synthesis
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        // Use different waveforms for different voices
        if (voice.name === 'bass') {
          osc.type = 'triangle';
        } else if (voice.name === 'tenor') {
          osc.type = 'sawtooth';
        } else {
          osc.type = 'sine';
        }

        osc.frequency.setValueAtTime(voice.frequency, audioContext.currentTime);
        gain.gain.setValueAtTime(volume * 0.2, audioContext.currentTime);

        osc.connect(gain);
        gain.connect(outputGain);
        osc.start();

        voiceNodes.current.set(voice.name, { 
          oscillator: osc,
          gain,
          voiceType: voice.name 
        });
      }
    });
  }, [audioContext, outputGain, voiceVolumes, synthSettings]);

  const setVoiceVolume = useCallback((voiceName: keyof VoiceVolumes, volume: number) => {
    setVoiceVolumes(prev => ({ ...prev, [voiceName]: volume }));
    
    // Update volume for currently playing voice
    const node = voiceNodes.current.get(voiceName);
    if (node && audioContext) {
      if (node.gain) {
        // Simple oscillator mode
        node.gain.gain.setValueAtTime(volume * 0.2, audioContext.currentTime);
      } else if (node.synthesizer) {
        // Formant mode - would need to re-synthesize
        // For now, just update the stored volume
      }
    }
  }, [audioContext, synthSettings.vowel]);

  const stopAllVoices = useCallback(() => {
    voiceNodes.current.forEach(node => {
      if (node.synthesizer) {
        node.synthesizer.stop();
        node.synthesizer.disconnect();
      }
      if (node.oscillator) {
        node.oscillator.stop();
        node.oscillator.disconnect();
      }
      if (node.gain) {
        node.gain.disconnect();
      }
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
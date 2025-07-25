import { useRef, useCallback } from 'react';
import { HarmonyVoice } from '../types';

export const useSynthesizer = (audioContext: AudioContext | null, outputGain: GainNode | null) => {
  const oscillators = useRef<Map<string, OscillatorNode>>(new Map());

  const synthesizeVoices = useCallback((harmony: HarmonyVoice[]) => {
    if (!audioContext || !outputGain) return;

    // Stop existing oscillators
    oscillators.current.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    oscillators.current.clear();

    // Create new oscillators for each voice
    harmony.forEach(voice => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(voice.frequency, audioContext.currentTime);
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);

      osc.connect(gain);
      gain.connect(outputGain);

      osc.start();
      oscillators.current.set(voice.name, osc);
    });
  }, [audioContext, outputGain]);

  const stopAllVoices = useCallback(() => {
    oscillators.current.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    oscillators.current.clear();
  }, []);

  return { synthesizeVoices, stopAllVoices };
};
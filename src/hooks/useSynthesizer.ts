import { useRef, useCallback, useState } from 'react';
import { HarmonyVoice } from '../types';

interface VoiceNode {
  oscillator: OscillatorNode;
  gain: GainNode;
}

export interface VoiceVolumes {
  soprano: number;
  alto: number;
  tenor: number;
  bass: number;
}

export const useSynthesizer = (audioContext: AudioContext | null, outputGain: GainNode | null) => {
  const voiceNodes = useRef<Map<string, VoiceNode>>(new Map());
  const [voiceVolumes, setVoiceVolumes] = useState<VoiceVolumes>({
    soprano: 0.25,
    alto: 0.25,
    tenor: 0.25,
    bass: 0.25
  });

  const synthesizeVoices = useCallback((harmony: HarmonyVoice[]) => {
    if (!audioContext || !outputGain) return;

    // Stop existing oscillators
    voiceNodes.current.forEach(node => {
      node.oscillator.stop();
      node.oscillator.disconnect();
      node.gain.disconnect();
    });
    voiceNodes.current.clear();

    // Create new oscillators for each voice
    harmony.forEach(voice => {
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
      
      // Apply individual voice volume
      const volume = voiceVolumes[voice.name];
      gain.gain.setValueAtTime(volume * 0.2, audioContext.currentTime); // Scale down overall volume

      osc.connect(gain);
      gain.connect(outputGain);

      osc.start();
      voiceNodes.current.set(voice.name, { oscillator: osc, gain });
    });
  }, [audioContext, outputGain, voiceVolumes]);

  const setVoiceVolume = useCallback((voiceName: keyof VoiceVolumes, volume: number) => {
    setVoiceVolumes(prev => ({ ...prev, [voiceName]: volume }));
    
    // Update gain for currently playing voice
    const node = voiceNodes.current.get(voiceName);
    if (node && audioContext) {
      node.gain.gain.setValueAtTime(volume * 0.2, audioContext.currentTime);
    }
  }, [audioContext]);

  const stopAllVoices = useCallback(() => {
    voiceNodes.current.forEach(node => {
      node.oscillator.stop();
      node.oscillator.disconnect();
      node.gain.disconnect();
    });
    voiceNodes.current.clear();
  }, []);

  return { synthesizeVoices, stopAllVoices, voiceVolumes, setVoiceVolume };
};
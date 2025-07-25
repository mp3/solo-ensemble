import { useRef, useCallback, useState, useEffect } from 'react';
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

export const useSimpleSynthesizer = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [outputGain, setOutputGain] = useState<GainNode | null>(null);
  const voiceNodes = useRef<Map<string, VoiceNode>>(new Map());
  const [voiceVolumes, setVoiceVolumes] = useState<VoiceVolumes>({
    soprano: 0.5,
    alto: 0.5,
    tenor: 0.5,
    bass: 0.5
  });

  // Method to set audio nodes
  const setAudioNodes = useCallback((context: AudioContext | null, gain: GainNode | null) => {
    console.log('Setting audio nodes:', { context: !!context, gain: !!gain });
    setAudioContext(context);
    setOutputGain(gain);
  }, []);

  const synthesizeVoices = useCallback((harmony: HarmonyVoice[]) => {
    console.log('SimpleSynthesizer: synthesizeVoices called', {
      harmony,
      hasContext: !!audioContext,
      hasOutputGain: !!outputGain
    });
    
    if (!audioContext || !outputGain) {
      console.error('SimpleSynthesizer: Missing audio context or output gain');
      return;
    }

    // Stop existing oscillators
    voiceNodes.current.forEach(node => {
      try {
        node.oscillator.stop();
        node.oscillator.disconnect();
        node.gain.disconnect();
      } catch (e) {
        // Ignore errors
      }
    });
    voiceNodes.current.clear();

    // Create new oscillators
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
      
      const volume = voiceVolumes[voice.name];
      gain.gain.setValueAtTime(volume * 0.2, audioContext.currentTime);

      osc.connect(gain);
      gain.connect(outputGain);
      
      osc.start();
      voiceNodes.current.set(voice.name, { oscillator: osc, gain });
      
      console.log(`Started oscillator for ${voice.name} at ${voice.frequency}Hz`);
    });
  }, [audioContext, outputGain, voiceVolumes]);

  const setVoiceVolume = useCallback((voiceName: keyof VoiceVolumes, volume: number) => {
    setVoiceVolumes(prev => ({ ...prev, [voiceName]: volume }));
    
    const node = voiceNodes.current.get(voiceName);
    if (node && audioContext) {
      node.gain.gain.setValueAtTime(volume * 0.2, audioContext.currentTime);
    }
  }, [audioContext]);

  const stopAllVoices = useCallback(() => {
    voiceNodes.current.forEach(node => {
      try {
        node.oscillator.stop();
        node.oscillator.disconnect();
        node.gain.disconnect();
      } catch (e) {
        // Ignore errors
      }
    });
    voiceNodes.current.clear();
  }, []);

  return { 
    synthesizeVoices, 
    stopAllVoices, 
    voiceVolumes, 
    setVoiceVolume,
    setAudioNodes,
    synthSettings: { useFormants: false, vowel: 'ah' },
    setVowel: () => {},
    toggleFormants: () => {}
  };
};
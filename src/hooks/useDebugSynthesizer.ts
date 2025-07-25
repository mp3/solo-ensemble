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

export const useDebugSynthesizer = (
  audioContext: AudioContext | null, 
  outputGain: GainNode | null
) => {
  const voiceNodes = useRef<Map<string, VoiceNode>>(new Map());
  const [voiceVolumes] = useState<VoiceVolumes>({
    soprano: 0.5,
    alto: 0.5,
    tenor: 0.5,
    bass: 0.5
  });

  const testTone = useCallback(() => {
    if (!audioContext || !outputGain) {
      console.error('No audio context or output gain');
      return;
    }

    console.log('Testing audio output...');
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.frequency.setValueAtTime(440, audioContext.currentTime);
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    osc.connect(gain);
    gain.connect(outputGain);
    gain.connect(audioContext.destination); // Direct connection for testing
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.5);
    
    console.log('Test tone played');
  }, [audioContext, outputGain]);

  const synthesizeVoices = useCallback((harmony: HarmonyVoice[]) => {
    console.log('synthesizeVoices called with:', harmony);
    
    if (!audioContext || !outputGain) {
      console.error('Missing audio context or output gain');
      return;
    }

    // Stop existing oscillators
    voiceNodes.current.forEach(node => {
      try {
        node.oscillator.stop();
        node.oscillator.disconnect();
        node.gain.disconnect();
      } catch (e) {
        console.error('Error stopping oscillator:', e);
      }
    });
    voiceNodes.current.clear();

    // Create new oscillators
    harmony.forEach(voice => {
      console.log(`Creating oscillator for ${voice.name} at ${voice.frequency}Hz`);
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(voice.frequency, audioContext.currentTime);
      
      const volume = voiceVolumes[voice.name];
      gain.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);

      osc.connect(gain);
      gain.connect(outputGain);
      gain.connect(audioContext.destination); // Also connect directly for debugging
      
      osc.start();
      voiceNodes.current.set(voice.name, { oscillator: osc, gain });
      
      console.log(`Started oscillator for ${voice.name}`);
    });
    
    console.log('All oscillators started');
  }, [audioContext, outputGain, voiceVolumes]);

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
    testTone
  };
};
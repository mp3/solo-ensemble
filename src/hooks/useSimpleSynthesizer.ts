import { useRef, useCallback, useState, useEffect } from 'react';
import { HarmonyVoice } from '../types';
import { FormantSynthesizer } from '../utils/formantSynthesis';

interface VoiceNode {
  oscillator?: OscillatorNode;
  gain?: GainNode;
  synthesizer?: FormantSynthesizer;
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

export const useSimpleSynthesizer = (
  initialVolumes?: VoiceVolumes,
  initialUseFormants?: boolean,
  initialVowel?: string
) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [outputGain, setOutputGain] = useState<GainNode | null>(null);
  const voiceNodes = useRef<Map<string, VoiceNode>>(new Map());
  const [voiceVolumes, setVoiceVolumes] = useState<VoiceVolumes>(initialVolumes || {
    soprano: 0.5,
    alto: 0.5,
    tenor: 0.5,
    bass: 0.5
  });
  
  const [synthSettings, setSynthSettings] = useState<SynthesizerSettings>({
    useFormants: initialUseFormants ?? true,  // Default to formant mode
    vowel: initialVowel || 'ah'
  });

  // Method to set audio nodes
  const setAudioNodes = useCallback((context: AudioContext | null, gain: GainNode | null) => {
    console.log('Setting audio nodes:', { context: !!context, gain: !!gain });
    setAudioContext(context);
    setOutputGain(gain);
  }, []);

  const synthesizeVoices = useCallback((harmony: HarmonyVoice[]) => {
    console.log('Synthesizer: synthesizeVoices called', {
      harmony,
      hasContext: !!audioContext,
      hasOutputGain: !!outputGain,
      mode: synthSettings.useFormants ? 'formant' : 'simple'
    });
    
    if (!audioContext || !outputGain) {
      console.error('Synthesizer: Missing audio context or output gain');
      return;
    }

    // Stop existing voices
    voiceNodes.current.forEach(node => {
      try {
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
      } catch (e) {
        // Ignore errors
      }
    });
    voiceNodes.current.clear();

    // Create new voices
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
        voiceNodes.current.set(voice.name, { synthesizer });
        console.log(`Started formant synthesizer for ${voice.name} at ${voice.frequency}Hz`);
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
        voiceNodes.current.set(voice.name, { oscillator: osc, gain });
        console.log(`Started oscillator for ${voice.name} at ${voice.frequency}Hz`);
      }
    });
  }, [audioContext, outputGain, voiceVolumes, synthSettings]);

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
      } catch (e) {
        // Ignore errors
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
    setAudioNodes,
    synthSettings,
    setVowel,
    toggleFormants
  };
};
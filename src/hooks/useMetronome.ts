import { useRef, useCallback, useState } from 'react';

export interface MetronomeState {
  isPlaying: boolean;
  currentBeat: number;
  bpm: number;
  beatsPerBar: number;
}

export const useMetronome = (audioContext: AudioContext | null) => {
  const [metronomeState, setMetronomeState] = useState<MetronomeState>({
    isPlaying: false,
    currentBeat: 1,
    bpm: 120,
    beatsPerBar: 4
  });

  const nextNoteTime = useRef(0);
  const timerID = useRef<number | null>(null);
  const currentBeatRef = useRef(1);

  const scheduleNote = useCallback((time: number, beatNumber: number) => {
    if (!audioContext) return;

    // Create oscillator for click
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();

    // Different pitch for downbeat
    const frequency = beatNumber === 1 ? 1000 : 800;
    osc.frequency.setValueAtTime(frequency, time);
    
    // Create click envelope
    envelope.gain.setValueAtTime(0.3, time);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    // Connect and play
    osc.connect(envelope);
    envelope.connect(audioContext.destination);
    osc.start(time);
    osc.stop(time + 0.05);
  }, [audioContext]);

  const scheduler = useCallback(() => {
    if (!audioContext) return;

    // Schedule all notes that need to play before the next interval
    while (nextNoteTime.current < audioContext.currentTime + 0.1) {
      scheduleNote(nextNoteTime.current, currentBeatRef.current);
      
      // Advance beat number
      currentBeatRef.current = (currentBeatRef.current % metronomeState.beatsPerBar) + 1;
      setMetronomeState(prev => ({ ...prev, currentBeat: currentBeatRef.current }));

      // Advance time by one beat
      const secondsPerBeat = 60.0 / metronomeState.bpm;
      nextNoteTime.current += secondsPerBeat;
    }
  }, [audioContext, scheduleNote, metronomeState.beatsPerBar, metronomeState.bpm]);

  const startMetronome = useCallback(() => {
    if (!audioContext) return;

    currentBeatRef.current = 1;
    nextNoteTime.current = audioContext.currentTime;
    
    const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
    
    const scheduleLoop = () => {
      scheduler();
      timerID.current = window.setTimeout(scheduleLoop, lookahead);
    };

    scheduleLoop();
    setMetronomeState(prev => ({ ...prev, isPlaying: true }));
  }, [audioContext, scheduler]);

  const stopMetronome = useCallback(() => {
    if (timerID.current !== null) {
      clearTimeout(timerID.current);
      timerID.current = null;
    }
    setMetronomeState(prev => ({ ...prev, isPlaying: false, currentBeat: 1 }));
  }, []);

  const setBpm = useCallback((bpm: number) => {
    setMetronomeState(prev => ({ ...prev, bpm }));
  }, []);

  const toggleMetronome = useCallback(() => {
    if (metronomeState.isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  }, [metronomeState.isPlaying, startMetronome, stopMetronome]);

  return {
    metronomeState,
    toggleMetronome,
    setBpm
  };
};
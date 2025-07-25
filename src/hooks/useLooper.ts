import { useRef, useCallback, useState } from 'react';
import { Track } from '../types';

interface LooperState {
  isPlaying: boolean;
  currentBar: number;
  nextLoopTime: number;
}

export const useLooper = (
  audioContext: AudioContext | null,
  outputGain: GainNode | null,
  bpm: number = 120,
  totalBars: number = 4
) => {
  const [looperState, setLooperState] = useState<LooperState>({
    isPlaying: false,
    currentBar: 1,
    nextLoopTime: 0
  });

  const schedulerRef = useRef<number | null>(null);
  const playbackSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());

  // Calculate timing constants
  const secondsPerBeat = 60 / bpm;
  const secondsPerBar = secondsPerBeat * 4; // 4/4 time
  const loopDuration = secondsPerBar * totalBars;
  const scheduleAheadTime = 0.1; // Schedule 100ms ahead
  const schedulerInterval = 25; // Run scheduler every 25ms

  const scheduleTrack = useCallback((track: Track, when: number) => {
    if (!audioContext || !outputGain) return;

    // Stop any existing playback of this track
    const existingSource = playbackSourcesRef.current.get(track.id);
    if (existingSource) {
      existingSource.stop();
      existingSource.disconnect();
    }

    // Create new source
    const source = audioContext.createBufferSource();
    source.buffer = track.audioBuffer;
    source.loop = true;
    source.loopEnd = loopDuration;
    
    // Connect to output
    source.connect(outputGain);
    
    // Start playback
    source.start(when);
    
    // Store reference
    playbackSourcesRef.current.set(track.id, source);
  }, [audioContext, outputGain, loopDuration]);

  const scheduler = useCallback((tracks: Track[]) => {
    if (!audioContext) return;

    const currentTime = audioContext.currentTime;
    
    // Check if we need to schedule the next loop iteration
    if (currentTime + scheduleAheadTime >= looperState.nextLoopTime) {
      // Schedule all tracks to start at the next loop point
      tracks.forEach(track => {
        scheduleTrack(track, looperState.nextLoopTime);
      });

      // Update next loop time
      setLooperState(prev => ({
        ...prev,
        nextLoopTime: prev.nextLoopTime + loopDuration,
        currentBar: 1
      }));
    }

    // Update current bar
    const elapsedTime = currentTime - (looperState.nextLoopTime - loopDuration);
    const currentBar = Math.floor(elapsedTime / secondsPerBar) + 1;
    
    if (currentBar !== looperState.currentBar && currentBar <= totalBars) {
      setLooperState(prev => ({ ...prev, currentBar }));
    }
  }, [audioContext, looperState, scheduleTrack, loopDuration, secondsPerBar, scheduleAheadTime, totalBars]);

  const startPlayback = useCallback((tracks: Track[]) => {
    if (!audioContext || tracks.length === 0) return;

    // Initialize timing
    const startTime = audioContext.currentTime + 0.1;
    setLooperState({
      isPlaying: true,
      currentBar: 1,
      nextLoopTime: startTime + loopDuration
    });

    // Schedule all tracks to start
    tracks.forEach(track => {
      scheduleTrack(track, startTime);
    });

    // Start scheduler
    const scheduleLoop = () => {
      scheduler(tracks);
      schedulerRef.current = window.setTimeout(scheduleLoop, schedulerInterval);
    };
    scheduleLoop();
  }, [audioContext, scheduler, scheduleTrack, loopDuration, schedulerInterval]);

  const stopPlayback = useCallback(() => {
    // Stop scheduler
    if (schedulerRef.current !== null) {
      clearTimeout(schedulerRef.current);
      schedulerRef.current = null;
    }

    // Stop all playing sources
    playbackSourcesRef.current.forEach(source => {
      source.stop();
      source.disconnect();
    });
    playbackSourcesRef.current.clear();

    // Reset state
    setLooperState({
      isPlaying: false,
      currentBar: 1,
      nextLoopTime: 0
    });
  }, []);

  return {
    looperState,
    startPlayback,
    stopPlayback
  };
};
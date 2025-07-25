import { useRef, useCallback, useState } from 'react';
import { Track } from '../types';

interface LooperState {
  isPlaying: boolean;
  currentBar: number;
  nextLoopTime: number;
}

interface TrackNode {
  source: AudioBufferSourceNode;
  gain: GainNode;
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
  const trackNodesRef = useRef<Map<string, TrackNode>>(new Map());
  const mutedTracksRef = useRef<Set<string>>(new Set());
  const soloedTracksRef = useRef<Set<string>>(new Set());

  // Calculate timing constants
  const secondsPerBeat = 60 / bpm;
  const secondsPerBar = secondsPerBeat * 4; // 4/4 time
  const loopDuration = secondsPerBar * totalBars;
  const scheduleAheadTime = 0.1; // Schedule 100ms ahead
  const schedulerInterval = 25; // Run scheduler every 25ms

  const updateTrackGain = useCallback((trackId: string) => {
    const node = trackNodesRef.current.get(trackId);
    if (!node || !audioContext) return;

    const hasSoloedTracks = soloedTracksRef.current.size > 0;
    let shouldPlay = false;

    if (hasSoloedTracks) {
      shouldPlay = soloedTracksRef.current.has(trackId);
    } else {
      shouldPlay = !mutedTracksRef.current.has(trackId);
    }

    node.gain.gain.setValueAtTime(shouldPlay ? 1 : 0, audioContext.currentTime);
  }, [audioContext]);

  const scheduleTrack = useCallback((track: Track, when: number) => {
    if (!audioContext || !outputGain) return;

    // Stop any existing playback of this track
    const existingNode = trackNodesRef.current.get(track.id);
    if (existingNode) {
      existingNode.source.stop();
      existingNode.source.disconnect();
      existingNode.gain.disconnect();
    }

    // Create new source with gain node for mute/solo
    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    
    source.buffer = track.audioBuffer;
    source.loop = true;
    source.loopEnd = loopDuration;
    
    // Connect through gain node
    source.connect(gain);
    gain.connect(outputGain);
    
    // Apply mute/solo state
    const hasSoloedTracks = soloedTracksRef.current.size > 0;
    let shouldPlay = false;
    
    if (hasSoloedTracks) {
      shouldPlay = soloedTracksRef.current.has(track.id);
    } else {
      shouldPlay = !mutedTracksRef.current.has(track.id);
    }
    
    gain.gain.setValueAtTime(shouldPlay ? 1 : 0, when);
    
    // Start playback
    source.start(when);
    
    // Store reference
    trackNodesRef.current.set(track.id, { source, gain });
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
    trackNodesRef.current.forEach(node => {
      node.source.stop();
      node.source.disconnect();
      node.gain.disconnect();
    });
    trackNodesRef.current.clear();

    // Reset state
    setLooperState({
      isPlaying: false,
      currentBar: 1,
      nextLoopTime: 0
    });
  }, []);

  const toggleMute = useCallback((trackId: string) => {
    if (mutedTracksRef.current.has(trackId)) {
      mutedTracksRef.current.delete(trackId);
    } else {
      mutedTracksRef.current.add(trackId);
    }
    updateTrackGain(trackId);
  }, [updateTrackGain]);

  const toggleSolo = useCallback((trackId: string) => {
    if (soloedTracksRef.current.has(trackId)) {
      soloedTracksRef.current.delete(trackId);
    } else {
      soloedTracksRef.current.add(trackId);
    }
    
    // Update all track gains when solo state changes
    trackNodesRef.current.forEach((_, id) => {
      updateTrackGain(id);
    });
  }, [updateTrackGain]);

  return {
    looperState,
    startPlayback,
    stopPlayback,
    toggleMute,
    toggleSolo,
    mutedTracks: mutedTracksRef.current,
    soloedTracks: soloedTracksRef.current
  };
};
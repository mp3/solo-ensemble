import { useRef, useCallback, useState } from 'react';
import { Track } from '../types';
import { useUndoRedo } from './useUndoRedo';

export const useRecorderWithUndo = (stream: MediaStream | null, audioContext: AudioContext | null) => {
  const [isRecording, setIsRecording] = useState(false);
  const {
    state: tracks,
    setState: setTracks,
    undo: undoTracks,
    redo: redoTracks,
    canUndo,
    canRedo,
    clearHistory
  } = useUndoRedo<Track[]>([]);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const pendingTrackRef = useRef<Track | null>(null);

  const startRecording = useCallback(() => {
    if (!stream) return;

    recordedChunks.current = [];
    mediaRecorder.current = new MediaRecorder(stream);
    
    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
      if (audioContext) {
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const track: Track = {
            id: `track-${Date.now()}`,
            audioBuffer,
            name: `Track ${tracks.length + 1}`,
            timestamp: Date.now()
          };
          
          // Store the pending track temporarily
          pendingTrackRef.current = track;
          
          // Add track to history
          setTracks(prev => [...prev, track]);
        } catch (error) {
          console.error('Failed to decode audio:', error);
        }
      }
    };

    mediaRecorder.current.start();
    setIsRecording(true);
  }, [stream, audioContext, tracks.length, setTracks, setIsRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  }, [isRecording, setIsRecording]);

  const clearTracks = useCallback(() => {
    setTracks([]);
    clearHistory();
  }, [setTracks, clearHistory]);

  const deleteTrack = useCallback((trackId: string) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
  }, [setTracks]);

  const undo = useCallback(() => {
    undoTracks();
    // Also undo the recording state if needed
    if (pendingTrackRef.current && tracks.length > 0 && 
        tracks[tracks.length - 1]?.id === pendingTrackRef.current.id) {
      pendingTrackRef.current = null;
    }
  }, [undoTracks, tracks]);

  const redo = useCallback(() => {
    redoTracks();
  }, [redoTracks]);

  return {
    isRecording,
    tracks,
    startRecording,
    stopRecording,
    clearTracks,
    deleteTrack,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
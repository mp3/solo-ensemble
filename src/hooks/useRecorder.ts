import { useState, useRef, useCallback } from 'react';
import { Track } from '../types';

export const useRecorder = (stream: MediaStream | null, audioContext: AudioContext | null) => {
  const [isRecording, setIsRecording] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

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
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const track: Track = {
          id: `track-${Date.now()}`,
          audioBuffer,
          name: `Track ${tracks.length + 1}`,
          timestamp: Date.now()
        };
        
        setTracks(prev => [...prev, track]);
      }
    };

    mediaRecorder.current.start();
    setIsRecording(true);
  }, [stream, audioContext, tracks.length]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const clearTracks = useCallback(() => {
    setTracks([]);
  }, []);

  return {
    isRecording,
    tracks,
    startRecording,
    stopRecording,
    clearTracks
  };
};
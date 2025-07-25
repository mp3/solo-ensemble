import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AudioControls } from './components/AudioControls';
import { PitchDisplay } from './components/PitchDisplay';
import { HarmonyControls } from './components/HarmonyControls';
import { HarmonyDisplay } from './components/HarmonyDisplay';
import { LevelMeter } from './components/LevelMeter';
import { RecorderControls } from './components/RecorderControls';
import { TrackList } from './components/TrackList';
import { VoiceControls } from './components/VoiceControls';
import { WaveformDisplay } from './components/WaveformDisplay';
import { SpectrumAnalyzer } from './components/SpectrumAnalyzer';
import { useAudioContext } from './hooks/useAudioContext';
import { useSynthesizer } from './hooks/useSynthesizer';
import { useRecorder } from './hooks/useRecorder';
import { useLevelMeter } from './hooks/useLevelMeter';
import { useLooper } from './hooks/useLooper';
import { generateHarmony, quantizeToScale } from './utils/harmony';
import { 
  PitchData, 
  HarmonyVoice, 
  LoopState, 
  AudioState, 
  HarmonySettings 
} from './types';

function App() {
  const [audioState, setAudioState] = useState<AudioState>({
    isStarted: false,
    latency: 0,
    inputLevel: 0,
    outputLevel: 0
  });

  const [currentPitch, setCurrentPitch] = useState<PitchData | null>(null);
  const [harmony, setHarmony] = useState<HarmonyVoice[]>([]);
  const [loopState, setLoopState] = useState<LoopState>({
    isRecording: false,
    isPlaying: false,
    currentBar: 1,
    totalBars: 4,
    bpm: 120
  });

  const [settings, setSettings] = useState<HarmonySettings>({
    key: 'C',
    scale: 'major',
    voicing: 'triad'
  });

  const streamRef = useRef<MediaStream | null>(null);
  const latencyRef = useRef<number>(0);

  const { audioNodes, initializeAudio } = useAudioContext();
  const { synthesizeVoices, voiceVolumes, setVoiceVolume } = useSynthesizer(
    audioNodes.context,
    audioNodes.outputGain
  );
  const { isRecording, tracks, startRecording, stopRecording, clearTracks } = useRecorder(
    streamRef.current,
    audioNodes.context
  );
  
  const { looperState, startPlayback, stopPlayback } = useLooper(
    audioNodes.context,
    audioNodes.outputGain,
    loopState.bpm,
    loopState.totalBars
  );

  const inputLevel = useLevelMeter(audioNodes.analyser);

  const handlePitchData = useCallback((data: PitchData) => {
    setCurrentPitch(data);
    
    if (data.note && data.confidence > 0.8) {
      const quantized = quantizeToScale(
        data.note.note,
        data.note.octave,
        settings.key,
        settings.scale
      );
      
      const newHarmony = generateHarmony(
        quantized.note,
        quantized.octave,
        settings.scale,
        settings.voicing
      );
      
      setHarmony(newHarmony);
      synthesizeVoices(newHarmony);
      
      // Update latency
      const now = performance.now();
      const latency = now - latencyRef.current;
      setAudioState(prev => ({ ...prev, latency }));
      latencyRef.current = now;
    }
  }, [settings, synthesizeVoices]);

  const handleStartAudio = useCallback(async () => {
    try {
      const { stream } = await initializeAudio(handlePitchData);
      streamRef.current = stream;
      setAudioState(prev => ({ ...prev, isStarted: true }));
      latencyRef.current = performance.now();
    } catch (error) {
      console.error('Error starting audio:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }, [initializeAudio, handlePitchData]);

  const handleRecord = useCallback(() => {
    if (!isRecording) {
      // Start playback for overdubbing if tracks exist
      if (tracks.length > 0 && !looperState.isPlaying) {
        startPlayback(tracks);
      }
      
      startRecording();
      setLoopState(prev => ({ ...prev, isRecording: true }));
      
      // Auto-stop after loop duration
      const barDuration = (60 / loopState.bpm) * 4 * 1000;
      setTimeout(() => {
        stopRecording();
        setLoopState(prev => ({ ...prev, isRecording: false }));
      }, barDuration * loopState.totalBars);
    } else {
      stopRecording();
      setLoopState(prev => ({ ...prev, isRecording: false }));
    }
  }, [isRecording, startRecording, stopRecording, loopState.bpm, loopState.totalBars, tracks, looperState.isPlaying, startPlayback]);

  const handlePlay = useCallback(() => {
    if (tracks.length > 0) {
      startPlayback(tracks);
      setLoopState(prev => ({ 
        ...prev, 
        isPlaying: true,
        currentBar: looperState.currentBar 
      }));
    }
  }, [tracks, startPlayback, looperState.currentBar]);

  const handleStop = useCallback(() => {
    stopPlayback();
    setLoopState(prev => ({ ...prev, isPlaying: false, currentBar: 1 }));
  }, [stopPlayback]);

  useEffect(() => {
    setAudioState(prev => ({ ...prev, inputLevel }));
  }, [inputLevel]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-5">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-2">Solo Ensemble</h1>
          <p className="text-text-secondary">Real-time vocal harmonizer with looping recorder</p>
        </header>

        <div className="grid gap-5">
          <AudioControls
            isAudioStarted={audioState.isStarted}
            onStartAudio={handleStartAudio}
            latency={audioState.latency}
          />

          {audioState.isStarted && (
            <>
              <PitchDisplay
                note={currentPitch?.note || null}
                confidence={currentPitch?.confidence || 0}
              />

              <HarmonyControls
                settings={settings}
                onSettingsChange={setSettings}
              />

              <HarmonyDisplay harmony={harmony} />

              <div className="grid gap-3 mb-5">
                <h3 className="text-text-secondary text-center">Voice Volumes</h3>
                <div className="grid grid-cols-2 gap-3">
                  <VoiceControls
                    voiceName="soprano"
                    volume={voiceVolumes.soprano}
                    onVolumeChange={(v) => setVoiceVolume('soprano', v)}
                    color="text-yellow-400"
                  />
                  <VoiceControls
                    voiceName="alto"
                    volume={voiceVolumes.alto}
                    onVolumeChange={(v) => setVoiceVolume('alto', v)}
                    color="text-pink-400"
                  />
                  <VoiceControls
                    voiceName="tenor"
                    volume={voiceVolumes.tenor}
                    onVolumeChange={(v) => setVoiceVolume('tenor', v)}
                    color="text-sky-300"
                  />
                  <VoiceControls
                    voiceName="bass"
                    volume={voiceVolumes.bass}
                    onVolumeChange={(v) => setVoiceVolume('bass', v)}
                    color="text-green-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <WaveformDisplay analyser={audioNodes.analyser} />
                <SpectrumAnalyzer analyser={audioNodes.analyser} />
              </div>

              <div className="flex gap-5 justify-center">
                <LevelMeter label="Input" level={inputLevel} />
                <LevelMeter label="Output" level={audioState.outputLevel} />
              </div>

              <RecorderControls
                loopState={{ 
                  ...loopState, 
                  isRecording,
                  isPlaying: looperState.isPlaying,
                  currentBar: looperState.isPlaying ? looperState.currentBar : loopState.currentBar
                }}
                onRecord={handleRecord}
                onPlay={handlePlay}
                onStop={handleStop}
                onClear={clearTracks}
              />

              <TrackList tracks={tracks} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
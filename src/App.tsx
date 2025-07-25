import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
import { ExportControls } from './components/ExportControls';
import { MetronomeControls } from './components/MetronomeControls';
import { MIDIControls } from './components/MIDIControls';
import { SynthesizerControls } from './components/SynthesizerControls';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { UndoRedoControls } from './components/UndoRedoControls';
import { useAudioContext } from './hooks/useAudioContext';
import { useFormantSynthesizer } from './hooks/useFormantSynthesizer';
// import { useDebugSynthesizer } from './hooks/useDebugSynthesizer';
import { useRecorderWithUndo } from './hooks/useRecorderWithUndo';
import { useLevelMeter } from './hooks/useLevelMeter';
import { useLooper } from './hooks/useLooper';
import { useMetronome } from './hooks/useMetronome';
import { useMIDI } from './hooks/useMIDI';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { saveSettings, loadSettings, SavedSettings } from './utils/localStorage';
import { generateHarmony, quantizeToScale } from './utils/harmony';
import { 
  PitchData, 
  HarmonyVoice, 
  LoopState, 
  AudioState, 
  HarmonySettings 
} from './types';

function App() {
  // Load saved settings on mount
  const savedSettings = loadSettings();
  
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
    bpm: savedSettings?.bpm || 120
  });

  const [settings, setSettings] = useState<HarmonySettings>({
    key: savedSettings?.key || 'C',
    scale: savedSettings?.scale || 'major',
    voicing: savedSettings?.voicing || 'triad'
  });

  const streamRef = useRef<MediaStream | null>(null);
  const latencyRef = useRef<number>(0);

  const { audioNodes, initializeAudio } = useAudioContext();
  const { 
    synthesizeVoices, 
    voiceVolumes, 
    setVoiceVolume,
    synthSettings,
    setVowel,
    toggleFormants
  } = useFormantSynthesizer(
    audioNodes.context,
    audioNodes.outputGain,
    savedSettings?.voiceVolumes,
    savedSettings?.useFormants,
    savedSettings?.vowel
  );
  const { 
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
  } = useRecorderWithUndo(
    streamRef.current,
    audioNodes.context
  );
  
  const { 
    looperState, 
    startPlayback, 
    stopPlayback,
    toggleMute,
    toggleSolo,
    mutedTracks,
    soloedTracks
  } = useLooper(
    audioNodes.context,
    audioNodes.outputGain,
    loopState.bpm,
    loopState.totalBars
  );
  
  const { metronomeState, toggleMetronome, setBpm } = useMetronome(audioNodes.context);
  
  const { 
    midiState, 
    setMIDIInput, 
    setMIDIOutput, 
    sendHarmonyMIDI,
    onNoteReceived 
  } = useMIDI();
  
  // Sync metronome BPM with loop state
  useEffect(() => {
    setBpm(loopState.bpm);
  }, [loopState.bpm, setBpm]);
  
  // Save settings when they change
  useEffect(() => {
    const currentSettings: SavedSettings = {
      key: settings.key,
      scale: settings.scale,
      voicing: settings.voicing,
      bpm: loopState.bpm,
      voiceVolumes,
      useFormants: synthSettings.useFormants,
      vowel: synthSettings.vowel
    };
    saveSettings(currentSettings);
  }, [settings, loopState.bpm, voiceVolumes, synthSettings]);
  
  // Re-synthesize when audio context becomes available
  useEffect(() => {
    if (audioNodes.context && audioNodes.outputGain && harmony.length > 0) {
      console.log('Audio context ready, re-synthesizing harmony');
      synthesizeVoices(harmony);
    }
  }, [audioNodes.context, audioNodes.outputGain, harmony, synthesizeVoices]);

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
      
      // Only synthesize if audio context is ready
      if (audioNodes.context && audioNodes.outputGain) {
        synthesizeVoices(newHarmony);
      }
      
      // Send harmony via MIDI if output is connected
      if (midiState.selectedOutput) {
        const midiNotes = newHarmony.map(voice => voice.midi);
        sendHarmonyMIDI(midiNotes);
      }
      
      // Update latency
      const now = performance.now();
      const latency = now - latencyRef.current;
      setAudioState(prev => ({ ...prev, latency }));
      latencyRef.current = now;
    }
  }, [settings, synthesizeVoices, midiState.selectedOutput, sendHarmonyMIDI, audioNodes.context, audioNodes.outputGain]);

  const handleStartAudio = useCallback(async () => {
    try {
      const { stream, context, nodes } = await initializeAudio(handlePitchData);
      streamRef.current = stream;
      setAudioState(prev => ({ ...prev, isStarted: true }));
      latencyRef.current = performance.now();
      console.log('Audio initialized:', {
        context,
        nodes,
        audioNodesAfter: audioNodes
      });
    } catch (error) {
      console.error('Error starting audio:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }, [initializeAudio, handlePitchData, audioNodes]);

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
  
  // Setup MIDI note input handling
  useEffect(() => {
    onNoteReceived((note) => {
      // Convert MIDI note to pitch data
      const frequency = 440 * Math.pow(2, (note.midi - 69) / 12);
      const pitchData: PitchData = {
        pitch: frequency,
        confidence: 1.0,
        note: note,
        timestamp: performance.now()
      };
      handlePitchData(pitchData);
    });
  }, [onNoteReceived, handlePitchData]);
  
  // Setup keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    onRecord: handleRecord,
    onPlay: handlePlay,
    onStop: handleStop,
    onClear: clearTracks,
    onMetronome: toggleMetronome,
    onExport: () => {
      // Trigger export programmatically
      const exportBtn = document.querySelector('[data-export-button]') as HTMLButtonElement;
      exportBtn?.click();
    },
    onUndo: undo,
    onRedo: redo
  }, audioState.isStarted);

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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
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
                  
                  <UndoRedoControls
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onUndo={undo}
                    onRedo={redo}
                  />
                </div>
              </div>

              <TrackList 
                tracks={tracks}
                mutedTracks={mutedTracks}
                soloedTracks={soloedTracks}
                onToggleMute={toggleMute}
                onToggleSolo={toggleSolo}
                onDeleteTrack={deleteTrack}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <MetronomeControls
                  metronomeState={metronomeState}
                  onToggle={toggleMetronome}
                  onBpmChange={(bpm) => {
                    setBpm(bpm);
                    setLoopState(prev => ({ ...prev, bpm }));
                  }}
                  disabled={!audioState.isStarted}
                />
                
                <div data-export-button>
                  <ExportControls
                    tracks={tracks}
                    disabled={looperState.isPlaying || isRecording}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SynthesizerControls
                  settings={synthSettings}
                  onVowelChange={setVowel}
                  onToggleFormants={toggleFormants}
                />
                
                <MIDIControls
                  isConnected={midiState.isConnected}
                  inputs={midiState.inputs}
                  outputs={midiState.outputs}
                  selectedInput={midiState.selectedInput}
                  selectedOutput={midiState.selectedOutput}
                  onInputChange={setMIDIInput}
                  onOutputChange={setMIDIOutput}
                />
              </div>
              <KeyboardShortcuts shortcuts={shortcuts} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
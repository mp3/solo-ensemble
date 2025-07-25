export interface PitchData {
  pitch: number;
  confidence: number;
  note: NoteInfo | null;
  timestamp: number;
}

export interface NoteInfo {
  note: string;
  octave: number;
  midi: number;
  cents: number;
}

export type Scale = 'major' | 'minor';
export type VoicingType = 'triad' | 'satb' | 'close' | 'open';

export interface HarmonyVoice {
  name: 'soprano' | 'alto' | 'tenor' | 'bass';
  midi: number;
  note: string;
  frequency: number;
}

export interface LoopState {
  isRecording: boolean;
  isPlaying: boolean;
  currentBar: number;
  totalBars: number;
  bpm: number;
}

export interface Track {
  id: string;
  audioBuffer: AudioBuffer;
  name: string;
  timestamp: number;
}

export interface AudioState {
  isStarted: boolean;
  latency: number;
  inputLevel: number;
  outputLevel: number;
}

export interface HarmonySettings {
  key: string;
  scale: Scale;
  voicing: VoicingType;
}

export interface AppState {
  audio: AudioState;
  currentPitch: PitchData | null;
  harmony: HarmonyVoice[];
  loop: LoopState;
  tracks: Track[];
  settings: HarmonySettings;
}
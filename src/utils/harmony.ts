import { Scale, VoicingType, HarmonyVoice } from '../types';

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const scaleIntervals: Record<Scale, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10]
};

export const noteToMidi = (note: string, octave: number): number => {
  const noteIndex = noteNames.indexOf(note);
  return (octave + 1) * 12 + noteIndex;
};

export const midiToFrequency = (midi: number): number => {
  return 440 * Math.pow(2, (midi - 69) / 12);
};

export const midiToNote = (midi: number): string => {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${noteNames[noteIndex]}${octave}`;
};

const getScaleNotes = (root: string, scale: Scale): number[] => {
  const rootIndex = noteNames.indexOf(root);
  const intervals = scaleIntervals[scale];
  
  return intervals.map(interval => (rootIndex + interval) % 12);
};

const generateTriad = (rootMidi: number, scaleNotes: number[]): HarmonyVoice[] => {
  const third = rootMidi + scaleIntervals.major[2]!;
  const fifth = rootMidi + scaleIntervals.major[4]!;
  
  return [
    {
      name: 'bass',
      midi: rootMidi,
      note: midiToNote(rootMidi),
      frequency: midiToFrequency(rootMidi)
    },
    {
      name: 'tenor',
      midi: third,
      note: midiToNote(third),
      frequency: midiToFrequency(third)
    },
    {
      name: 'alto',
      midi: fifth,
      note: midiToNote(fifth),
      frequency: midiToFrequency(fifth)
    },
    {
      name: 'soprano',
      midi: rootMidi + 12,
      note: midiToNote(rootMidi + 12),
      frequency: midiToFrequency(rootMidi + 12)
    }
  ];
};

const generateSATB = (rootMidi: number, scaleNotes: number[]): HarmonyVoice[] => {
  const bass = rootMidi - 12;
  const tenor = rootMidi;
  const alto = rootMidi + scaleIntervals.major[2]!;
  const soprano = rootMidi + scaleIntervals.major[4]! + 12;
  
  return [
    {
      name: 'bass',
      midi: bass,
      note: midiToNote(bass),
      frequency: midiToFrequency(bass)
    },
    {
      name: 'tenor',
      midi: tenor,
      note: midiToNote(tenor),
      frequency: midiToFrequency(tenor)
    },
    {
      name: 'alto',
      midi: alto,
      note: midiToNote(alto),
      frequency: midiToFrequency(alto)
    },
    {
      name: 'soprano',
      midi: soprano,
      note: midiToNote(soprano),
      frequency: midiToFrequency(soprano)
    }
  ];
};

const generateCloseHarmony = (rootMidi: number, scaleNotes: number[]): HarmonyVoice[] => {
  return [
    {
      name: 'bass',
      midi: rootMidi,
      note: midiToNote(rootMidi),
      frequency: midiToFrequency(rootMidi)
    },
    {
      name: 'tenor',
      midi: rootMidi + 3,
      note: midiToNote(rootMidi + 3),
      frequency: midiToFrequency(rootMidi + 3)
    },
    {
      name: 'alto',
      midi: rootMidi + 5,
      note: midiToNote(rootMidi + 5),
      frequency: midiToFrequency(rootMidi + 5)
    },
    {
      name: 'soprano',
      midi: rootMidi + 7,
      note: midiToNote(rootMidi + 7),
      frequency: midiToFrequency(rootMidi + 7)
    }
  ];
};

const generateOpenHarmony = (rootMidi: number, scaleNotes: number[]): HarmonyVoice[] => {
  return [
    {
      name: 'bass',
      midi: rootMidi - 12,
      note: midiToNote(rootMidi - 12),
      frequency: midiToFrequency(rootMidi - 12)
    },
    {
      name: 'tenor',
      midi: rootMidi + 4,
      note: midiToNote(rootMidi + 4),
      frequency: midiToFrequency(rootMidi + 4)
    },
    {
      name: 'alto',
      midi: rootMidi + 7,
      note: midiToNote(rootMidi + 7),
      frequency: midiToFrequency(rootMidi + 7)
    },
    {
      name: 'soprano',
      midi: rootMidi + 16,
      note: midiToNote(rootMidi + 16),
      frequency: midiToFrequency(rootMidi + 16)
    }
  ];
};

export const generateHarmony = (
  rootNote: string,
  octave: number,
  scale: Scale,
  voicing: VoicingType
): HarmonyVoice[] => {
  const rootMidi = noteToMidi(rootNote, octave);
  const scaleNotes = getScaleNotes(rootNote, scale);
  
  switch (voicing) {
    case 'triad':
      return generateTriad(rootMidi, scaleNotes);
    case 'satb':
      return generateSATB(rootMidi, scaleNotes);
    case 'close':
      return generateCloseHarmony(rootMidi, scaleNotes);
    case 'open':
      return generateOpenHarmony(rootMidi, scaleNotes);
    default:
      return generateTriad(rootMidi, scaleNotes);
  }
};

export const quantizeToScale = (
  detectedNote: string,
  detectedOctave: number,
  key: string,
  scale: Scale
): { note: string; octave: number; midi: number } => {
  const detectedMidi = noteToMidi(detectedNote, detectedOctave);
  const scaleNotes = getScaleNotes(key, scale);
  const detectedNoteIndex = noteNames.indexOf(detectedNote);
  
  let closestScaleNote = scaleNotes[0]!;
  let minDistance = 12;
  
  for (const scaleNote of scaleNotes) {
    const distance = Math.abs((detectedNoteIndex - scaleNote + 12) % 12);
    if (distance < minDistance) {
      minDistance = distance;
      closestScaleNote = scaleNote;
    }
  }
  
  const quantizedMidi = detectedOctave * 12 + closestScaleNote + 12;
  const quantizedNote = noteNames[closestScaleNote]!;
  
  return {
    note: quantizedNote,
    octave: detectedOctave,
    midi: quantizedMidi
  };
};
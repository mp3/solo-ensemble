import { useState, useEffect, useCallback, useRef } from 'react';
import { NoteInfo } from '../types';

interface MIDIState {
  isConnected: boolean;
  inputs: WebMidi.MIDIInput[];
  outputs: WebMidi.MIDIOutput[];
  selectedInput: string | null;
  selectedOutput: string | null;
}

export const useMIDI = () => {
  const [midiState, setMIDIState] = useState<MIDIState>({
    isConnected: false,
    inputs: [],
    outputs: [],
    selectedInput: null,
    selectedOutput: null
  });

  const midiAccess = useRef<WebMidi.MIDIAccess | null>(null);
  const selectedInputRef = useRef<WebMidi.MIDIInput | null>(null);
  const selectedOutputRef = useRef<WebMidi.MIDIOutput | null>(null);
  const noteCallbackRef = useRef<((note: NoteInfo) => void) | null>(null);

  // Initialize MIDI
  useEffect(() => {
    const initMIDI = async () => {
      try {
        const access = await navigator.requestMIDIAccess();
        midiAccess.current = access;

        const updateDevices = () => {
          const inputs = Array.from(access.inputs.values());
          const outputs = Array.from(access.outputs.values());
          
          setMIDIState(prev => ({
            ...prev,
            isConnected: true,
            inputs,
            outputs
          }));
        };

        // Listen for device changes
        access.onstatechange = updateDevices;
        updateDevices();

      } catch (error) {
        console.error('MIDI access failed:', error);
        setMIDIState(prev => ({ ...prev, isConnected: false }));
      }
    };

    initMIDI();
  }, []);

  // Handle MIDI input messages
  const handleMIDIMessage = useCallback((event: WebMidi.MIDIMessageEvent) => {
    const [status, note, velocity] = event.data;
    
    // Note on message (status 144-159)
    if (status >= 144 && status <= 159 && velocity > 0) {
      const noteInfo: NoteInfo = {
        midi: note,
        note: getNoteNameFromMIDI(note),
        octave: Math.floor(note / 12) - 1,
        cents: 0
      };
      
      if (noteCallbackRef.current) {
        noteCallbackRef.current(noteInfo);
      }
    }
  }, []);

  // Set MIDI input device
  const setMIDIInput = useCallback((deviceId: string | null) => {
    // Remove listener from previous input
    if (selectedInputRef.current) {
      selectedInputRef.current.onmidimessage = null;
    }

    if (deviceId && midiAccess.current) {
      const input = midiAccess.current.inputs.get(deviceId);
      if (input) {
        input.onmidimessage = handleMIDIMessage;
        selectedInputRef.current = input;
        setMIDIState(prev => ({ ...prev, selectedInput: deviceId }));
      }
    } else {
      selectedInputRef.current = null;
      setMIDIState(prev => ({ ...prev, selectedInput: null }));
    }
  }, [handleMIDIMessage]);

  // Set MIDI output device
  const setMIDIOutput = useCallback((deviceId: string | null) => {
    if (deviceId && midiAccess.current) {
      const output = midiAccess.current.outputs.get(deviceId);
      if (output) {
        selectedOutputRef.current = output;
        setMIDIState(prev => ({ ...prev, selectedOutput: deviceId }));
      }
    } else {
      selectedOutputRef.current = null;
      setMIDIState(prev => ({ ...prev, selectedOutput: null }));
    }
  }, []);

  // Send MIDI note
  const sendMIDINote = useCallback((note: number, velocity: number = 127, channel: number = 1) => {
    if (selectedOutputRef.current) {
      // Note on
      selectedOutputRef.current.send([0x90 | (channel - 1), note, velocity]);
      
      // Schedule note off after 100ms
      setTimeout(() => {
        if (selectedOutputRef.current) {
          selectedOutputRef.current.send([0x80 | (channel - 1), note, 0]);
        }
      }, 100);
    }
  }, []);

  // Send harmony as MIDI
  const sendHarmonyMIDI = useCallback((midiNotes: number[]) => {
    if (selectedOutputRef.current) {
      midiNotes.forEach((note, index) => {
        // Use different channels for different voices
        const channel = index + 1;
        sendMIDINote(note, 100, channel);
      });
    }
  }, [sendMIDINote]);

  // Set note callback
  const onNoteReceived = useCallback((callback: (note: NoteInfo) => void) => {
    noteCallbackRef.current = callback;
  }, []);

  return {
    midiState,
    setMIDIInput,
    setMIDIOutput,
    sendMIDINote,
    sendHarmonyMIDI,
    onNoteReceived
  };
};

// Helper function to convert MIDI note number to note name
function getNoteNameFromMIDI(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return noteNames[midi % 12]!;
}
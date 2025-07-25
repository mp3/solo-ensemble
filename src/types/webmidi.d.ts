declare namespace WebMidi {
  interface MIDIAccess {
    inputs: Map<string, MIDIInput>;
    outputs: Map<string, MIDIOutput>;
    onstatechange: ((event: MIDIConnectionEvent) => void) | null;
  }

  interface MIDIPort {
    id: string;
    name: string | null;
    manufacturer: string | null;
    version: string | null;
    type: 'input' | 'output';
    state: 'connected' | 'disconnected';
    connection: 'open' | 'closed' | 'pending';
  }

  interface MIDIInput extends MIDIPort {
    type: 'input';
    onmidimessage: ((event: MIDIMessageEvent) => void) | null;
  }

  interface MIDIOutput extends MIDIPort {
    type: 'output';
    send(data: number[] | Uint8Array, timestamp?: number): void;
  }

  interface MIDIMessageEvent extends Event {
    data: Uint8Array;
  }

  interface MIDIConnectionEvent extends Event {
    port: MIDIPort;
  }
}

interface Navigator {
  requestMIDIAccess(): Promise<WebMidi.MIDIAccess>;
}
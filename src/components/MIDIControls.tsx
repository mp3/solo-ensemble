import React from 'react';

interface MIDIControlsProps {
  isConnected: boolean;
  inputs: WebMidi.MIDIInput[];
  outputs: WebMidi.MIDIOutput[];
  selectedInput: string | null;
  selectedOutput: string | null;
  onInputChange: (deviceId: string | null) => void;
  onOutputChange: (deviceId: string | null) => void;
}

export const MIDIControls: React.FC<MIDIControlsProps> = ({
  isConnected,
  inputs,
  outputs,
  selectedInput,
  selectedOutput,
  onInputChange,
  onOutputChange
}) => {
  return (
    <div className="bg-surface p-5 rounded-lg">
      <h3 className="text-text-secondary font-medium mb-4">MIDI Settings</h3>
      
      {!isConnected ? (
        <p className="text-text-secondary text-sm">MIDI not available in this browser</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">MIDI Input</label>
            <select
              value={selectedInput || ''}
              onChange={(e) => onInputChange(e.target.value || null)}
              className="w-full bg-background text-text border border-white/20 px-3 py-2 rounded text-sm"
            >
              <option value="">None</option>
              {inputs.map(input => (
                <option key={input.id} value={input.id}>
                  {input.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">MIDI Output</label>
            <select
              value={selectedOutput || ''}
              onChange={(e) => onOutputChange(e.target.value || null)}
              className="w-full bg-background text-text border border-white/20 px-3 py-2 rounded text-sm"
            >
              <option value="">None</option>
              {outputs.map(output => (
                <option key={output.id} value={output.id}>
                  {output.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-text-secondary">
            <p>• Input: Receive MIDI notes for pitch detection</p>
            <p>• Output: Send generated harmonies as MIDI</p>
          </div>
        </div>
      )}
    </div>
  );
};
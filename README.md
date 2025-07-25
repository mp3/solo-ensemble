# Solo Ensemble

Real-time vocal harmonizer with looping recorder built with React, TypeScript, and Web Audio API.

## Features

- **Real-time pitch detection** using Yin algorithm in AudioWorklet
- **Auto-harmonization** with SATB voicing options
- **Key/scale quantization** for in-tune harmonies
- **4-bar loop recorder** with overdub capability
- **Low-latency audio processing** (<20ms target)
- **Visual feedback** with note display and level meters

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Web Audio API with AudioWorklet
- Vite for fast development

## Setup

```bash
pnpm install
pnpm run dev
```

Open http://localhost:3000 in your browser.

## Manual Testing

1. **Microphone Setup**
   - Click "Start Audio" button
   - Grant microphone permissions when prompted
   - Check that latency displays < 150ms

2. **Pitch Detection**
   - Sing or hum a clear note
   - Verify the detected note matches your pitch
   - Check confidence bar shows high confidence for steady notes

3. **Harmony Generation**
   - Select key (e.g., C major)
   - Sing notes in the scale
   - Verify harmony notes display correctly for each voicing type:
     - Triad: Root, 3rd, 5th
     - SATB: Traditional 4-part harmony
     - Close: Tight voicing within an octave
     - Open: Spread voicing across octaves

4. **Recording**
   - Press "Record" to start a 4-bar loop
   - Recording auto-stops after 4 bars at 120 BPM
   - Check that tracks appear in the track list

## Next Steps

- Implement looped playback with overdub functionality
- Replace oscillator synthesis with granular vocal formants
- Add WASM optimization for pitch detection
- Implement track mixing and individual track controls
- Add export functionality for recorded loops
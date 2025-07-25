# Solo Ensemble

Real-time vocal harmonizer with looping recorder built with React, TypeScript, and Web Audio API.

## Features

- **Real-time pitch detection** using Yin algorithm in AudioWorklet
- **Auto-harmonization** with SATB (Soprano, Alto, Tenor, Bass) voicing
- **Formant synthesis** for natural-sounding vocal harmonies
- **4-bar loop recorder** with overdub capability and undo/redo
- **Low-latency audio processing** (<20ms target)
- **Visual feedback** with spectrum analyzer, waveform display, and level meters
- **MIDI input/output** support for external controllers
- **Metronome** with visual and audio feedback
- **Track management** with mute/solo functionality
- **Export** recordings as WAV files
- **Keyboard shortcuts** for quick control
- **Settings persistence** via localStorage

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Web Audio API with AudioWorklet
- Vite for fast development
- pnpm for package management

## Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Run linting
pnpm run lint

# Run type checking
pnpm run typecheck
```

Open http://localhost:5173 in your browser.

## Usage Guide

### Getting Started

1. **Start Audio**: Click the "Start Audio" button and grant microphone permissions
2. **Check Latency**: Ensure latency is below 150ms for optimal performance
3. **Select Key & Scale**: Choose your desired key and scale for harmonization
4. **Choose Voicing**: Select from Triad, SATB, Close, or Open voicing options

### Recording & Playback

- **Record**: Press R or click Record button to start a 4-bar loop
- **Play/Stop**: Press Space or use playback controls
- **Overdub**: Recording while tracks exist will layer new audio
- **Undo/Redo**: Ctrl+Z / Ctrl+Shift+Z for recording history
- **Clear All**: Press C to remove all tracks

### Voice Controls

- **Volume**: Adjust individual voice volumes (Soprano, Alto, Tenor, Bass)
- **Mute/Solo**: Click M/S buttons on tracks for mixing
- **Synthesis Mode**: Toggle between Simple (oscillator) and Formant modes
- **Vowel Selection**: Choose vowel sound for formant synthesis

### Advanced Features

- **MIDI**: Connect MIDI devices for note input/output
- **Metronome**: Press M to toggle, adjust BPM (60-200)
- **Export**: Save your loops as WAV files
- **Keyboard Shortcuts**: Press ? to view all shortcuts

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Stop |
| R | Record |
| C | Clear all tracks |
| M | Toggle metronome |
| E | Export audio |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| ? | Show shortcuts |

## Technical Details

### Audio Processing Pipeline

1. **Input**: Microphone → Web Audio API
2. **Pitch Detection**: AudioWorklet running Yin algorithm
3. **Harmony Generation**: Real-time SATB voice calculation
4. **Synthesis**: Formant-based voice synthesis or simple oscillators
5. **Output**: Mixed audio → speakers + visual feedback

### Performance Optimizations

- AudioWorklet for low-latency pitch detection
- Efficient formant synthesis using biquad filters
- Optimized React rendering with memoization
- Minimal state updates during audio processing

## Browser Requirements

- Chrome/Edge 89+ (recommended)
- Firefox 76+
- Safari 14.1+
- Requires secure context (HTTPS or localhost)

## Known Limitations

- Initial audio startup may take 1-2 seconds
- Formant synthesis is CPU-intensive with all 4 voices
- MIDI support varies by browser/OS
- Export limited to 4-bar loops

## Development

### Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── worklets/      # AudioWorklet processors
└── types.ts       # TypeScript definitions
```

### Key Technologies

- **Yin Algorithm**: Fundamental frequency detection
- **Formant Synthesis**: Vocal tract modeling with biquad filters
- **Web Audio API**: Real-time audio processing
- **AudioWorklet**: Low-latency audio processing thread
- **React Hooks**: State management and side effects

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm run lint` and `pnpm run typecheck`
5. Submit a pull request

## License

MIT
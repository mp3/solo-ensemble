# Solo Ensemble

Real-time vocal harmonizer with looping recorder built with React, TypeScript, and Web Audio API.

## Features

- **Real-time pitch detection** using Yin algorithm in AudioWorklet
- **Auto-harmonization** with SATB (Soprano, Alto, Tenor, Bass) voicing
- **Formant synthesis** for natural-sounding vocal harmonies
- **4-bar loop recorder** with overdub capability and undo/redo
- **Low-latency audio processing** (<20ms target) with built-in latency tester
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
2. **Check Latency**: Monitor real-time latency display (target <20ms)
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
- **Vowel Selection**: Choose vowel sound for formant synthesis (A, E, I, O, U, AH)

### Advanced Features

- **MIDI**: Connect MIDI devices for note input/output
- **Metronome**: Press M to toggle, adjust BPM (60-200)
- **Export**: Save your loops as WAV files
- **Latency Testing**: Run built-in latency tests to optimize performance
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

## Performance & Latency

### Built-in Latency Tester

The application includes a latency testing component that measures:
- Average round-trip latency
- Min/Max latency values
- Sample rate and base latency
- Color-coded results (Green: <20ms, Yellow: 20-50ms, Red: >50ms)

### Optimization Tips

For best performance and lowest latency:

1. **Use Chrome/Edge** with hardware acceleration enabled
2. **Close other audio applications**
3. **Use Simple synthesis mode** for lowest CPU usage
4. **Set system audio to 48kHz** sample rate
5. **Disable audio enhancements** in system settings

See [LATENCY_OPTIMIZATION.md](LATENCY_OPTIMIZATION.md) for detailed optimization guide.

## Technical Details

### Audio Processing Pipeline

1. **Input**: Microphone → Web Audio API
2. **Pitch Detection**: AudioWorklet running Yin algorithm (configurable buffer size)
3. **Harmony Generation**: Real-time SATB voice calculation
4. **Synthesis**: Formant-based voice synthesis or simple oscillators
5. **Output**: Mixed audio → speakers + visual feedback

### Performance Optimizations

- AudioWorklet for low-latency pitch detection
- Configurable buffer sizes (512-2048 samples)
- Efficient formant synthesis using biquad filters
- Optimized React rendering with memoization
- Minimal state updates during audio processing

### Key Files

- `src/worklets/pitch-detector.js` - Main pitch detection algorithm
- `src/worklets/pitch-detector-optimized.js` - Low-latency optimized version
- `src/utils/formantSynthesis.ts` - Formant synthesis implementation
- `src/hooks/useSimpleSynthesizer.ts` - Unified synthesizer with both modes
- `src/components/LatencyTester.tsx` - Latency measurement component

## Browser Requirements

- Chrome/Edge 89+ (recommended for lowest latency)
- Firefox 76+
- Safari 14.1+
- Requires secure context (HTTPS or localhost)

## Known Limitations

- Initial audio startup may take 1-2 seconds
- Formant synthesis is CPU-intensive with all 4 voices
- MIDI support varies by browser/OS
- Export limited to 4-bar loops
- Latency depends on system audio configuration

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

### Running Tests

```bash
# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# Manual latency testing
# 1. Start the app with `pnpm run dev`
# 2. Click "Start Audio"
# 3. Use the Latency Tester component
# 4. Target: <20ms average latency
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm run lint` and `pnpm run typecheck`
5. Test latency impact of changes
6. Submit a pull request

## License

MIT
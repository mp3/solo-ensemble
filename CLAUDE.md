# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Solo Ensemble is a real-time vocal harmonizer with looping recorder built with React, TypeScript, and Web Audio API. It detects pitch from microphone input, generates SATB harmonies, and synthesizes vocal sounds using formant synthesis.

## Commands

```bash
# Development
pnpm install       # Install dependencies
pnpm run dev      # Start dev server at http://localhost:5173
pnpm run build    # Build for production
pnpm run preview  # Preview production build
pnpm run typecheck # Run TypeScript type checking

# Note: No linting command is configured yet (pnpm run lint mentioned in README but not in package.json)
```

## Architecture

### Core Audio Processing Flow

1. **Input Chain**: Microphone → `useAudioContext` → AudioWorklet (`pitch-detector.js`)
2. **Processing**: Pitch detection (Yin algorithm) → Harmony generation → Voice synthesis
3. **Output**: Synthesized voices → Audio output + Visual feedback

### Key Architectural Decisions

- **AudioWorklet for Pitch Detection**: Low-latency processing in separate thread
- **Two Synthesis Modes**: Simple (oscillators) and Formant (natural voice simulation)
- **React Hooks Architecture**: All audio logic encapsulated in custom hooks
- **TypeScript**: Strict typing throughout, see `src/types.ts` for core interfaces

### Critical Performance Considerations

- **Latency Target**: <20ms (see LATENCY_OPTIMIZATION.md)
- **Buffer Size**: 2048 samples default, optimized version uses 1024
- **Formant Mode**: CPU-intensive, use Simple mode for lowest latency
- **State Updates**: Minimized during audio processing to prevent glitches

### Key Files for Audio Logic

- `src/worklets/pitch-detector.js` - Yin algorithm implementation
- `src/hooks/useAudioContext.ts` - Web Audio API initialization
- `src/hooks/useSimpleSynthesizer.ts` - Unified synthesizer (both modes)
- `src/utils/formantSynthesis.ts` - Formant synthesis with biquad filters
- `src/utils/harmony.ts` - SATB harmony generation logic

### State Management Pattern

- Local React state for UI
- Custom hooks for audio state
- LocalStorage for settings persistence
- Undo/redo system for recordings (`useUndoRedo`)

### Testing Latency

Use the built-in LatencyTester component to measure actual system latency. Target is <20ms average.

## Important Notes

- **Package Manager**: Must use pnpm (v10.13.1)
- **AudioWorklet Files**: Plain JavaScript (not TypeScript) for compatibility
- **Browser Requirements**: Chrome/Edge recommended for lowest latency
- **Audio Context**: Initialize only after user interaction (browser security)
# Latency Optimization Guide for Solo Ensemble

## Current Latency Sources

The total latency in the Solo Ensemble application comes from several sources:

1. **Input Latency** (~2-5ms)
   - Microphone to Web Audio API
   - Dependent on audio interface and driver

2. **Processing Latency** (~10-15ms)
   - Pitch detection in AudioWorklet
   - Harmony calculation
   - Voice synthesis

3. **Output Latency** (~2-5ms)
   - Web Audio API to speakers
   - Dependent on audio interface and driver

## Optimization Strategies

### 1. AudioContext Configuration

The application already uses optimal settings in `useAudioContext.ts`:

```typescript
audio: {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  latency: 0,
}
```

### 2. AudioWorklet Optimization

The pitch detector worklet (`pitch-detector.js`) uses:
- Buffer size of 2048 samples (46ms at 44.1kHz)
- This could be reduced to 1024 or 512 for lower latency
- Trade-off: smaller buffers = less accurate pitch detection

### 3. Reduce Processing Overhead

Current optimizations:
- Direct AudioWorklet processing (no ScriptProcessor)
- Minimal state updates during audio processing
- Efficient Yin algorithm implementation

### 4. Browser-Specific Settings

For Chrome/Edge:
- Use WASAPI exclusive mode on Windows
- Enable "Hardware Acceleration" in browser settings

For Firefox:
- Set `media.cubeb.latency_playback` to 256 in about:config
- Set `media.cubeb.latency_capture` to 256 in about:config

### 5. System-Level Optimizations

Windows:
- Use ASIO drivers if available
- Set audio to 48kHz sample rate system-wide
- Disable audio enhancements

macOS:
- Use Core Audio directly
- Set Audio MIDI Setup to 48kHz
- Reduce buffer size in Audio MIDI Setup

Linux:
- Use JACK audio with real-time kernel
- Configure ALSA for low latency

## Testing Methodology

### 1. Round-Trip Latency Test

1. Generate a click/impulse
2. Record it through the system
3. Measure time difference

### 2. Visual Latency Test

1. Sing a note and observe visual feedback
2. The app already displays latency in the UI
3. Target: <20ms consistently

### 3. Perceptual Test

1. Use the metronome as reference
2. Sing along and listen for delay
3. <20ms should feel "immediate"

## Performance Monitoring

The application includes built-in latency monitoring:

```typescript
// In App.tsx
const now = performance.now();
const latency = now - latencyRef.current;
setAudioState(prev => ({ ...prev, latency }));
```

This measures the time between pitch detection cycles.

## Recommended Settings for Low Latency

1. **Sample Rate**: 48kHz (system-wide)
2. **Buffer Size**: 256-512 samples
3. **Browser**: Chrome/Edge with hardware acceleration
4. **Audio Interface**: Native ASIO/Core Audio drivers
5. **Formant Mode**: Use Simple mode for lowest latency

## Known Limitations

1. **Web Audio API Constraints**
   - Cannot directly control buffer sizes
   - Limited to browser's audio implementation

2. **AudioWorklet Buffer Size**
   - Currently 2048 samples for stability
   - Reducing may cause glitches

3. **Formant Synthesis Overhead**
   - Multiple biquad filters add ~2-3ms
   - Consider Simple mode for lowest latency

## Future Optimizations

1. **WebAssembly (WASM)**
   - Port Yin algorithm to WASM
   - Could reduce processing by 30-50%

2. **Shared Array Buffer**
   - Enable zero-copy audio processing
   - Requires secure context and headers

3. **GPU Acceleration**
   - Use WebGL for FFT calculations
   - Parallel processing for formant synthesis

## Validation Checklist

- [ ] Latency displays <20ms in UI
- [ ] No perceptible delay when singing
- [ ] Smooth visual feedback
- [ ] No audio glitches or dropouts
- [ ] CPU usage remains reasonable (<50%)

## Troubleshooting High Latency

1. **Check Browser Console**
   - Look for audio underrun warnings
   - Check for performance issues

2. **System Audio Settings**
   - Verify sample rate matches (48kHz)
   - Disable audio enhancements
   - Close other audio applications

3. **Try Simple Mode**
   - Toggle off Formant synthesis
   - Reduces processing overhead

4. **Reduce Visual Updates**
   - Disable spectrum analyzer if needed
   - Reduce waveform update rate

## Conclusion

Achieving <20ms latency requires optimization at multiple levels:
- Browser configuration
- System audio settings  
- Efficient code implementation
- Appropriate trade-offs between features and performance

The current implementation should achieve 15-25ms latency on modern systems with proper configuration.
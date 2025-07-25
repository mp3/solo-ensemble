class PitchDetectorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    this.sampleRate = 44100;
    // Reduced buffer size for lower latency
    // 1024 samples = ~23ms at 44.1kHz, ~21ms at 48kHz
    this.bufferSize = 1024;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    
    // Yin algorithm parameters
    this.threshold = 0.15;
    this.probabilityThreshold = 0.1;
    
    // Processing control - process every frame for lowest latency
    this.frameCount = 0;
    this.processEveryNFrames = 2; // Reduced from 4
    
    // Performance optimization: pre-allocate arrays
    this.yinBuffer = new Float32Array(this.bufferSize / 2);
    
    this.port.onmessage = (event) => {
      if (event.data.sampleRate) {
        this.sampleRate = event.data.sampleRate;
      }
      if (event.data.bufferSize) {
        // Allow dynamic buffer size configuration
        this.bufferSize = event.data.bufferSize;
        this.buffer = new Float32Array(this.bufferSize);
        this.yinBuffer = new Float32Array(this.bufferSize / 2);
      }
    };
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input && input.length > 0) {
      const inputChannel = input[0];
      
      // Fill buffer with input samples
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex] = inputChannel[i];
        this.bufferIndex = (this.bufferIndex + 1) % this.bufferSize;
      }
      
      // Process pitch detection at reduced rate
      this.frameCount++;
      if (this.frameCount % this.processEveryNFrames === 0) {
        const pitch = this.detectPitch();
        if (pitch) {
          this.port.postMessage({
            pitch: pitch.frequency,
            confidence: pitch.confidence,
            note: this.frequencyToNote(pitch.frequency),
            timestamp: currentTime
          });
        }
      }
    }
    
    return true;
  }
  
  detectPitch() {
    // Calculate RMS for confidence
    let rms = 0;
    for (let i = 0; i < this.bufferSize; i++) {
      rms += this.buffer[i] * this.buffer[i];
    }
    rms = Math.sqrt(rms / this.bufferSize);
    
    // Don't process if signal is too quiet
    if (rms < 0.01) return null;
    
    // Yin algorithm - optimized version
    const halfBuffer = Math.floor(this.bufferSize / 2);
    
    // Difference function - optimized
    let minTau = 2;
    let maxTau = halfBuffer;
    
    // Find the first minimum below threshold
    let tau = -1;
    let minVal = 1;
    
    for (let t = minTau; t < maxTau; t++) {
      let sum = 0;
      // Optimized inner loop
      for (let i = 0; i < halfBuffer; i++) {
        const delta = this.buffer[i] - this.buffer[i + t];
        sum += delta * delta;
      }
      
      // Cumulative mean normalized difference
      if (t > 0) {
        const cmnd = sum / ((sum + this.yinBuffer[t-1]) || 1);
        this.yinBuffer[t] = cmnd;
        
        if (cmnd < this.threshold && cmnd < minVal) {
          minVal = cmnd;
          tau = t;
          break; // Early exit for lower latency
        }
      }
    }
    
    if (tau === -1) return null;
    
    // Parabolic interpolation for more accurate frequency
    const x0 = tau - 1;
    const x2 = tau + 1;
    
    if (x0 >= 0 && x2 < halfBuffer) {
      const y0 = this.yinBuffer[x0] || 0;
      const y1 = this.yinBuffer[tau];
      const y2 = this.yinBuffer[x2] || 0;
      
      const a = (y0 - 2 * y1 + y2) / 2;
      const b = (y2 - y0) / 2;
      
      if (a !== 0) {
        tau = tau - b / (2 * a);
      }
    }
    
    const frequency = this.sampleRate / tau;
    const confidence = 1 - minVal;
    
    // Filter out unrealistic frequencies
    if (frequency < 50 || frequency > 2000) return null;
    
    return { frequency, confidence };
  }
  
  frequencyToNote(frequency) {
    const A4 = 440;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    const midiNumber = Math.round(12 * Math.log2(frequency / A4) + 69);
    const noteName = noteNames[midiNumber % 12];
    const octave = Math.floor(midiNumber / 12) - 1;
    
    return {
      note: noteName,
      octave: octave,
      midi: midiNumber,
      cents: Math.round((12 * Math.log2(frequency / A4) + 69 - midiNumber) * 100)
    };
  }
}

registerProcessor('pitch-detector', PitchDetectorProcessor);
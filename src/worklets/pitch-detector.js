class PitchDetectorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    this.sampleRate = 44100;
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    
    // Yin algorithm parameters
    this.threshold = 0.15;
    this.probabilityThreshold = 0.1;
    
    // Processing control
    this.frameCount = 0;
    this.processEveryNFrames = 4;
    
    this.port.onmessage = (event) => {
      if (event.data.sampleRate) {
        this.sampleRate = event.data.sampleRate;
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
    // Yin algorithm implementation
    const yinBuffer = new Float32Array(this.bufferSize / 2);
    let probability = 0;
    let tau;
    
    // Step 1: Calculate difference function
    for (tau = 1; tau < yinBuffer.length; tau++) {
      yinBuffer[tau] = 0;
      for (let i = 0; i < yinBuffer.length; i++) {
        const delta = this.buffer[i] - this.buffer[i + tau];
        yinBuffer[tau] += delta * delta;
      }
    }
    
    // Step 2: Calculate cumulative mean normalized difference
    yinBuffer[0] = 1;
    let runningSum = 0;
    for (tau = 1; tau < yinBuffer.length; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] *= tau / runningSum;
    }
    
    // Step 3: Find absolute threshold
    tau = 2;
    while (tau < yinBuffer.length - 1) {
      if (yinBuffer[tau] < this.threshold) {
        while (tau + 1 < yinBuffer.length && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau++;
        }
        probability = 1 - yinBuffer[tau];
        break;
      }
      tau++;
    }
    
    if (tau === yinBuffer.length - 1 || yinBuffer[tau] >= this.threshold) {
      return null;
    }
    
    // Step 4: Parabolic interpolation
    let betterTau;
    const x0 = (tau < 1) ? tau : tau - 1;
    const x2 = (tau + 1 < yinBuffer.length) ? tau + 1 : tau;
    
    if (x0 === tau) {
      betterTau = (yinBuffer[tau] <= yinBuffer[x2]) ? tau : x2;
    } else if (x2 === tau) {
      betterTau = (yinBuffer[tau] <= yinBuffer[x0]) ? tau : x0;
    } else {
      const s0 = yinBuffer[x0];
      const s1 = yinBuffer[tau];
      const s2 = yinBuffer[x2];
      betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
    }
    
    const frequency = this.sampleRate / betterTau;
    
    if (frequency < 80 || frequency > 2000) {
      return null;
    }
    
    return {
      frequency: frequency,
      confidence: probability
    };
  }
  
  frequencyToNote(frequency) {
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    
    if (frequency <= 0) return null;
    
    const halfStepsBelowC0 = 12 * Math.log2(frequency / C0);
    const noteNum = Math.round(halfStepsBelowC0) % 12;
    const octave = Math.floor(halfStepsBelowC0 / 12);
    
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    return {
      note: noteNames[noteNum],
      octave: octave,
      midi: Math.round(69 + 12 * Math.log2(frequency / A4)),
      cents: Math.round((halfStepsBelowC0 - Math.round(halfStepsBelowC0)) * 100)
    };
  }
}

registerProcessor('pitch-detector', PitchDetectorProcessor);
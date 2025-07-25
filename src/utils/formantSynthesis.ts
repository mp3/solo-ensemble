// Formant frequencies for different vowels and voice types
export interface FormantData {
  f1: number; // First formant frequency
  f2: number; // Second formant frequency
  f3: number; // Third formant frequency
  bandwidth: number[]; // Bandwidth for each formant
}

// Formant data for different vowels
const VOWEL_FORMANTS: Record<string, FormantData> = {
  'a': { f1: 730, f2: 1090, f3: 2440, bandwidth: [90, 110, 120] },
  'e': { f1: 530, f2: 1840, f3: 2480, bandwidth: [90, 100, 120] },
  'i': { f1: 270, f2: 2290, f3: 3010, bandwidth: [60, 90, 100] },
  'o': { f1: 570, f2: 840, f3: 2410, bandwidth: [90, 100, 120] },
  'u': { f1: 300, f2: 870, f3: 2240, bandwidth: [80, 100, 120] },
  'ah': { f1: 640, f2: 1190, f3: 2390, bandwidth: [80, 90, 100] }
};

// Voice type modifiers for formants
const VOICE_MODIFIERS = {
  soprano: { f1: 1.15, f2: 1.1, f3: 1.05, pitch: 1.2 },
  alto: { f1: 1.05, f2: 1.05, f3: 1.0, pitch: 1.0 },
  tenor: { f1: 0.95, f2: 0.95, f3: 0.95, pitch: 0.8 },
  bass: { f1: 0.85, f2: 0.9, f3: 0.9, pitch: 0.6 }
};

export class FormantSynthesizer {
  private context: AudioContext;
  private output: GainNode;
  private oscillators: OscillatorNode[] = [];
  private formantFilters: BiquadFilterNode[] = [];
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode;
  private masterGain: GainNode;

  constructor(context: AudioContext) {
    this.context = context;
    this.masterGain = context.createGain();
    this.output = context.createGain();
    this.noiseGain = context.createGain();
    
    this.masterGain.connect(this.output);
    this.output.gain.setValueAtTime(0.3, context.currentTime);
  }

  connect(destination: AudioNode) {
    this.output.connect(destination);
  }

  disconnect() {
    this.output.disconnect();
    this.stop();
  }

  synthesizeVowel(
    frequency: number,
    vowel: string = 'ah',
    voiceType: keyof typeof VOICE_MODIFIERS = 'alto',
    volume: number = 0.5
  ) {
    this.stop(); // Clean up any existing synthesis

    const formants = VOWEL_FORMANTS[vowel] || VOWEL_FORMANTS['ah'];
    const modifier = VOICE_MODIFIERS[voiceType];

    // Create harmonic oscillators
    const numHarmonics = 6;
    for (let i = 0; i < numHarmonics; i++) {
      const harmonic = i + 1;
      const osc = this.context.createOscillator();
      const oscGain = this.context.createGain();
      
      osc.frequency.setValueAtTime(frequency * harmonic, this.context.currentTime);
      
      // Decrease amplitude for higher harmonics
      const harmonicAmplitude = 1 / (harmonic * 0.8);
      oscGain.gain.setValueAtTime(harmonicAmplitude * 0.2, this.context.currentTime);
      
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      
      osc.start();
      this.oscillators.push(osc);
    }

    // Create formant filters
    const formantFrequencies = [
      formants.f1 * modifier.f1,
      formants.f2 * modifier.f2,
      formants.f3 * modifier.f3
    ];

    formantFrequencies.forEach((freq, index) => {
      const filter = this.context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, this.context.currentTime);
      filter.Q.setValueAtTime(freq / formants.bandwidth[index]!, this.context.currentTime);
      
      this.masterGain.connect(filter);
      filter.connect(this.output);
      
      this.formantFilters.push(filter);
    });

    // Add slight noise for breathiness
    this.addBreathiness();

    // Set overall volume
    this.output.gain.setValueAtTime(volume * 0.3, this.context.currentTime);
  }

  private addBreathiness() {
    const bufferSize = 2 * this.context.sampleRate;
    const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.noiseSource = this.context.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;

    const noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, this.context.currentTime);

    this.noiseGain.gain.setValueAtTime(0.02, this.context.currentTime);

    this.noiseSource.connect(noiseFilter);
    noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.output);

    this.noiseSource.start();
  }

  modulate(frequency: number, time: number) {
    // Add vibrato
    const vibratoRate = 4.5 + Math.random() * 1;
    const vibratoDepth = 0.02;

    this.oscillators.forEach((osc, index) => {
      const harmonic = index + 1;
      const targetFreq = frequency * harmonic;
      
      // Smooth frequency transition
      osc.frequency.linearRampToValueAtTime(targetFreq, time);
      
      // Add vibrato
      osc.frequency.setValueAtTime(
        targetFreq * (1 + vibratoDepth * Math.sin(2 * Math.PI * vibratoRate * time)),
        time
      );
    });
  }

  stop() {
    this.oscillators.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    this.oscillators = [];

    this.formantFilters.forEach(filter => {
      filter.disconnect();
    });
    this.formantFilters = [];

    if (this.noiseSource) {
      this.noiseSource.stop();
      this.noiseSource.disconnect();
      this.noiseSource = null;
    }

    this.noiseGain.disconnect();
    this.noiseGain = this.context.createGain();
  }
}
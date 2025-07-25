import { useRef, useCallback, useEffect } from 'react';

interface AudioNodes {
  context: AudioContext | null;
  analyser: AnalyserNode | null;
  inputGain: GainNode | null;
  outputGain: GainNode | null;
  pitchDetectorNode: AudioWorkletNode | null;
  destination: MediaStreamAudioDestinationNode | null;
}

export const useAudioContext = () => {
  const audioNodes = useRef<AudioNodes>({
    context: null,
    analyser: null,
    inputGain: null,
    outputGain: null,
    pitchDetectorNode: null,
    destination: null,
  });

  const initializeAudio = useCallback(async (onPitchData: (data: any) => void) => {
    try {
      // Create audio context
      const context = new AudioContext();
      audioNodes.current.context = context;

      // Get microphone input
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          latency: 0,
        },
      });

      const source = context.createMediaStreamSource(stream);

      // Create audio nodes
      const inputGain = context.createGain();
      const outputGain = context.createGain();
      const analyser = context.createAnalyser();
      const destination = context.createMediaStreamDestination();

      audioNodes.current.inputGain = inputGain;
      audioNodes.current.outputGain = outputGain;
      audioNodes.current.analyser = analyser;
      audioNodes.current.destination = destination;

      // Load and create pitch detector worklet
      await context.audioWorklet.addModule('/src/worklets/pitch-detector.js');
      const pitchDetectorNode = new AudioWorkletNode(context, 'pitch-detector');
      audioNodes.current.pitchDetectorNode = pitchDetectorNode;

      // Send sample rate to worklet
      pitchDetectorNode.port.postMessage({
        sampleRate: context.sampleRate,
      });

      // Handle pitch detection messages
      pitchDetectorNode.port.onmessage = (event) => {
        onPitchData(event.data);
      };

      // Connect audio graph
      source.connect(inputGain);
      inputGain.connect(pitchDetectorNode);
      inputGain.connect(analyser);

      outputGain.connect(destination);
      outputGain.connect(context.destination);

      return { context, nodes: audioNodes.current, stream: destination.stream };
    } catch (error) {
      console.error('Error initializing audio:', error);
      throw error;
    }
  }, []);

  const cleanup = useCallback(() => {
    const nodes = audioNodes.current;
    if (nodes.context) {
      nodes.context.close();
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    audioNodes: audioNodes.current,
    initializeAudio,
    cleanup,
  };
};
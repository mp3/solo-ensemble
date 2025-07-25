import React, { useState, useCallback } from 'react';

interface LatencyTesterProps {
  audioContext: AudioContext | null;
  outputGain: GainNode | null;
}

interface LatencyResult {
  timestamp: number;
  latency: number;
  bufferSize: number;
  sampleRate: number;
}

export const LatencyTester: React.FC<LatencyTesterProps> = ({
  audioContext,
  outputGain
}) => {
  const [results, setResults] = useState<LatencyResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runLatencyTest = useCallback(async () => {
    if (!audioContext || !outputGain) return;

    setTesting(true);
    const testResults: LatencyResult[] = [];

    // Run 10 tests
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      
      // Create a short click sound
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(outputGain);
      
      // Short click
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.setValueAtTime(0, audioContext.currentTime + 0.001);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.001);
      
      // Measure round-trip time
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      testResults.push({
        timestamp: Date.now(),
        latency,
        bufferSize: audioContext.baseLatency * audioContext.sampleRate,
        sampleRate: audioContext.sampleRate
      });
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setResults(testResults);
    setTesting(false);
  }, [audioContext, outputGain]);

  const averageLatency = results.length > 0
    ? results.reduce((sum, r) => sum + r.latency, 0) / results.length
    : 0;

  const minLatency = results.length > 0
    ? Math.min(...results.map(r => r.latency))
    : 0;

  const maxLatency = results.length > 0
    ? Math.max(...results.map(r => r.latency))
    : 0;

  return (
    <div className="bg-surface p-5 rounded-lg shadow-md">
      <h3 className="text-text-secondary text-center mb-4">Latency Testing</h3>
      
      <div className="space-y-4">
        <button
          onClick={runLatencyTest}
          disabled={!audioContext || testing}
          className="w-full bg-primary text-black px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? 'Testing...' : 'Run Latency Test'}
        </button>

        {results.length > 0 && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Average Latency:</span>
              <span className={`font-bold ${averageLatency < 20 ? 'text-green-400' : averageLatency < 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {averageLatency.toFixed(1)}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-text-secondary">Min/Max:</span>
              <span className="text-text">
                {minLatency.toFixed(1)}ms / {maxLatency.toFixed(1)}ms
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-secondary">Sample Rate:</span>
              <span className="text-text">{audioContext?.sampleRate}Hz</span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-secondary">Base Latency:</span>
              <span className="text-text">
                {audioContext ? (audioContext.baseLatency * 1000).toFixed(1) : 0}ms
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-secondary">Output Latency:</span>
              <span className="text-text">
                {audioContext ? (audioContext.outputLatency * 1000).toFixed(1) : 0}ms
              </span>
            </div>
          </div>
        )}

        <div className="text-xs text-text-secondary space-y-1">
          <p>• Target: &lt;20ms for real-time performance</p>
          <p>• &lt;10ms: Excellent (imperceptible)</p>
          <p>• 10-20ms: Good (barely perceptible)</p>
          <p>• 20-50ms: Acceptable (slight delay)</p>
          <p>• &gt;50ms: Poor (noticeable delay)</p>
        </div>
      </div>
    </div>
  );
};
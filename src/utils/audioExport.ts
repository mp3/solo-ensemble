export const exportToWav = (audioBuffer: AudioBuffer): Blob => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numberOfChannels * 2; // 16-bit samples
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, audioBuffer.sampleRate, true);
  view.setUint32(28, audioBuffer.sampleRate * numberOfChannels * 2, true); // byte rate
  view.setUint16(32, numberOfChannels * 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, length, true);

  // Interleave channels and convert to 16-bit PCM
  const channels: Float32Array[] = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel]![i]!));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

export const mixTracks = async (
  tracks: AudioBuffer[],
  outputSampleRate: number = 44100
): Promise<AudioBuffer> => {
  if (tracks.length === 0) {
    throw new Error('No tracks to mix');
  }

  // Find the longest track
  const maxLength = Math.max(...tracks.map(t => t.length));
  const numberOfChannels = Math.max(...tracks.map(t => t.numberOfChannels));

  // Create output buffer
  const audioContext = new OfflineAudioContext(
    numberOfChannels,
    maxLength,
    outputSampleRate
  );

  // Create buffer sources for each track
  tracks.forEach(track => {
    const source = audioContext.createBufferSource();
    source.buffer = track;
    source.connect(audioContext.destination);
    source.start(0);
  });

  // Render the mix
  const mixedBuffer = await audioContext.startRendering();
  return mixedBuffer;
};

export const downloadAudio = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
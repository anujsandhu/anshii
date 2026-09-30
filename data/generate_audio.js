// Node script to generate a beautiful, soothing 20-second looping chill ambient chord progression
const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const durationSeconds = 24;
const totalSamples = sampleRate * durationSeconds;
const numChannels = 2;
const bytesPerSample = 2;
const blockAlign = numChannels * bytesPerSample;
const byteRate = sampleRate * blockAlign;
const dataSize = totalSamples * blockAlign;

const buffer = Buffer.alloc(44 + dataSize);

// RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);

// fmt chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // subchunk1 size
buffer.writeUInt16LE(1, 20);  // PCM format
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(bytesPerSample * 8, 34);

// data chunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Chords: Cmaj9, Am9, Fmaj9, G13sus
// Note frequencies (Hz)
const chordProgressions = [
  // Cmaj9: C3, G3, B3, D4, E4
  { duration: 6, notes: [130.81, 196.00, 246.94, 293.66, 329.63] },
  // Am9: A2, E3, G3, C4, B4
  { duration: 6, notes: [110.00, 164.81, 196.00, 261.63, 493.88] },
  // Fmaj9: F2, C3, E3, A3, G4
  { duration: 6, notes: [87.31, 130.81, 164.81, 220.00, 392.00] },
  // Gsus/Em7: G2, D3, F3, B3, E4
  { duration: 6, notes: [98.00, 146.83, 174.61, 246.94, 329.63] },
];

let offset = 44;
let currentSample = 0;

for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  
  // Find which chord
  let chordIdx = Math.floor(t / 6) % 4;
  let chordTime = t % 6;
  let chord = chordProgressions[chordIdx];
  
  let leftSample = 0;
  let rightSample = 0;

  // Envelope for chord: soft attack, gentle decay
  let env = Math.min(chordTime * 2.0, 1.0) * Math.exp(-chordTime * 0.28);

  chord.notes.forEach((freq, idx) => {
    // Gentle warm Rhodes-like tone (fundamental + soft harmonics)
    let s = Math.sin(2 * Math.PI * freq * t) * 0.5 +
            Math.sin(4 * Math.PI * freq * t) * 0.2 +
            Math.sin(6 * Math.PI * freq * t) * 0.08;
    
    // Soft stereo panning
    let pan = 0.3 + 0.4 * (idx / (chord.notes.length - 1));
    leftSample += s * (1 - pan);
    rightSample += s * pan;
  });

  // Add subtle gentle vinyl lofi crackle / noise
  let noise = (Math.random() * 2 - 1) * 0.008;
  leftSample += noise;
  rightSample += noise;

  // Master volume and overall fade in/out for seamless loop
  let masterEnv = 0.35;
  if (t < 1.0) masterEnv *= (t / 1.0);
  if (t > durationSeconds - 1.0) masterEnv *= ((durationSeconds - t) / 1.0);

  leftSample = Math.max(-1, Math.min(1, leftSample * env * masterEnv));
  rightSample = Math.max(-1, Math.min(1, rightSample * env * masterEnv));

  // 16-bit PCM
  buffer.writeInt16LE(Math.floor(leftSample * 32767), offset);
  buffer.writeInt16LE(Math.floor(rightSample * 32767), offset + 2);
  offset += 4;
}

const outPath1 = path.join(__dirname, '../public/music/song.mp3');
const outPath2 = path.join(__dirname, '../public/music/song.wav');
fs.writeFileSync(outPath1, buffer);
fs.writeFileSync(outPath2, buffer);
console.log('Ambient music tracks generated successfully!');

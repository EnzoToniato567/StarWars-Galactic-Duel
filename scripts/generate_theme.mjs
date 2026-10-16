// Generate the original, loopable offline chiptune used by the game player.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const sampleRate = 11025;
const duration = 16;
const output = fileURLToPath(new URL("../public/audio/galactic-duel-theme.wav", import.meta.url));
const melody = [
  72, 75, 79, 75, 72, 70, 68, 70,
  72, 75, 80, 79, 75, 72, 70, 67,
  68, 72, 75, 72, 68, 67, 65, 67,
  70, 74, 77, 74, 70, 67, 65, 67,
  72, 75, 79, 82, 80, 79, 75, 72,
  70, 72, 75, 79, 77, 75, 72, 70,
  68, 72, 75, 80, 79, 75, 72, 68,
  67, 70, 74, 77, 75, 72, 70, 67,
];
const bassNotes = [
  48, 48, 44, 43, 41, 41, 43, 43,
  48, 48, 43, 43, 44, 44, 43, 43,
  48, 48, 44, 43, 41, 41, 43, 43,
  48, 48, 43, 43, 44, 44, 43, 43,
];
const frequency = (note) => 440 * 2 ** ((note - 69) / 12);
const sampleCount = sampleRate * duration;
const dataSize = sampleCount * 2;
const wav = Buffer.alloc(44 + dataSize);
wav.write("RIFF", 0);
wav.writeUInt32LE(36 + dataSize, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(dataSize, 40);

for (let index = 0; index < sampleCount; index++) {
  const time = index / sampleRate;
  const step = Math.min(Math.floor(time / 0.25), melody.length - 1);
  const stepTime = time % 0.25;
  const melodyPhase = (time * frequency(melody[step])) % 1;
  const lead = (melodyPhase < 0.5 ? 1 : -1) * Math.max(0, 1 - stepTime / 0.23);
  const bassNote = bassNotes[Math.min(Math.floor(time / 0.5), bassNotes.length - 1)];
  const bassPhase = (time * frequency(bassNote)) % 1;
  const bass = (1 - 4 * Math.abs(bassPhase - 0.5)) * 0.55;
  const beatTime = time % 0.5;
  const kick = Math.sin(2 * Math.PI * (75 * beatTime - 45 * beatTime ** 2)) * Math.exp(-beatTime * 23);
  const offbeat = (time + 0.5) % 1;
  const snare = offbeat < 0.12 ? Math.sin(index * 12.9898) * Math.exp(-offbeat * 35) : 0;
  const edge = Math.min(1, time / 0.008, (duration - time) / 0.008);
  const sample = Math.max(-1, Math.min(1, (0.27 * lead + 0.23 * bass + 0.18 * kick + 0.05 * snare) * edge));
  wav.writeInt16LE(Math.round(sample * 32767), 44 + index * 2);
}

mkdirSync(fileURLToPath(new URL("../public/audio/", import.meta.url)), { recursive: true });
writeFileSync(output, wav);

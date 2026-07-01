// Song-select PREVIEW audio, flat MP3s in assets/previews/, named <songId>.mp3
// (songId === Song.id, e.g. "10001.mp3", "13a3.mp3"). Mirrors utils/imageLoader.ts.
// Extracted + transcoded from the game (mono 64 kbps ~10 s clips) — see docs/dataassets-decryption.md.
//
// Playback: use expo-audio (SDK 54) e.g.
//   import { useAudioPlayer } from 'expo-audio';
//   const player = useAudioPlayer(getPreviewAudio(song.id));
//   player.play();

const audioContext = require.context('../assets/previews', false, /\.mp3$/);

const audioMap: { [key: string]: number } = {};
audioContext.keys().forEach((key: string) => {
  const fileName = key.split('/').pop() || '';   // "10001.mp3"
  const songId = fileName.replace(/\.mp3$/, '');  // "10001"
  audioMap[songId] = audioContext(key);
});

// Returns the require'd module id for a song's preview, or null if none bundled.
export const getPreviewAudio = (songId: string): number | null => {
  return audioMap[songId] ?? null;
};

export const hasPreviewAudio = (songId: string): boolean => songId in audioMap;

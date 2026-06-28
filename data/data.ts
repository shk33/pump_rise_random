// AUTO-GENERATED DATA LAYER — do not hand-edit.
// Regenerate from the game files with the scripts in C:\piu_extract (see report.md).
import songsData from './songs.json';

export type ChartMode = 'S' | 'D';

export interface Chart {
  mode: ChartMode;   // 'S' = Single, 'D' = Double
  level: number;
}

export interface Bpm {
  min: number | null;
  max: number | null;
  display: string;   // e.g. "155" or "140-169"
}

export interface Song {
  id: string;             // game's internal song ID (stable key; also the banner filename)
  title: string;
  artist: string;
  titleKor: string;
  artistKor: string;
  bpm: Bpm;
  version: string;        // Rise, Phoenix, XX, Prime 2, Prime, Fiesta 2, Fiesta EX, Fiesta, Legacy
  generation: number;     // raw game version index
  channel: number;        // 1 = normal, 3 = remix/special, 5 = special
  lengthType: number;     // 2 = standard, 3 = full/remix
  isRemix: boolean;
  charts: Chart[];        // canonical, structured (mode + level)
  banner: string;         // === id
  // Convenience view derived from `charts` so level/mode filtering stays trivial:
  levels: { single: number[]; double: number[] };
}

interface RawSong extends Omit<Song, 'levels'> {}

export const songs: Song[] = (songsData.songs as RawSong[]).map((s) => ({
  ...s,
  charts: s.charts as Chart[],
  levels: {
    single: s.charts.filter((c) => c.mode === 'S').map((c) => c.level).sort((a, b) => a - b),
    double: s.charts.filter((c) => c.mode === 'D').map((c) => c.level).sort((a, b) => a - b),
  },
}));

/** All distinct levels available for a song in a given mode. */
export const levelsForMode = (song: Song, mode: ChartMode): number[] =>
  song.charts.filter((c) => c.mode === mode).map((c) => c.level);

export const SONG_COUNT = songs.length;

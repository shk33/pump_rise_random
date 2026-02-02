import { songs, Song } from '../data/data';

type LeagueRule = {
  count: number;
  level: number;
  levelSelector?: 'exact' | 'higher';
};

// Represents a picked song with its specific chart type and level
export interface PickedSong extends Song {
  selectedLevel: number;
  selectedType: 'Single' | 'Double';
}

type League = {
  singles: LeagueRule[];
  doubles: LeagueRule[];
};

export const LEAGUE_DISPLAY_NAMES: Record<string, string> = {
  SSS: "League - SSS",
  S: "League - S",
  A: "League - A",
  B: "League - B",
  C: "League - C",
  D: "League - D",
};

const LEAGUES: Record<string, League> = {
  SSS: {
    singles: [
      { count: 3, level: 22 },
      { count: 3, level: 23 },
      { count: 2, level: 24, levelSelector: 'higher' },
    ],
    doubles: [
      { count: 1, level: 22 },
      { count: 1, level: 23 },
      { count: 2, level: 24 },
      { count: 2, level: 25 },
      { count: 2, level: 26, levelSelector: 'higher' },
    ],
  },
  S: {
    singles: [
      { count: 1, level: 20 },
      { count: 2, level: 21 },
      { count: 2, level: 22 },
      { count: 2, level: 23 },
      { count: 1, level: 24 },
    ],
    doubles: [
      { count: 2, level: 21 },
      { count: 2, level: 22 },
      { count: 1, level: 23 },
      { count: 1, level: 24 },
      { count: 1, level: 25 },
    ],
  },
  A: {
    singles: [
      { count: 1, level: 19 },
      { count: 1, level: 20 },
      { count: 2, level: 21 },
      { count: 2, level: 22 },
      { count: 1, level: 23 },
      { count: 1, level: 24 },
    ],
    doubles: [
      { count: 1, level: 19 },
      { count: 1, level: 20 },
      { count: 2, level: 21 },
      { count: 2, level: 22 },
      { count: 1, level: 23 },
      { count: 1, level: 24 },
    ],
  },
  B: {
    singles: [
      { count: 1, level: 18 },
      { count: 1, level: 19 },
      { count: 2, level: 20 },
      { count: 2, level: 21 },
      { count: 2, level: 22 },
    ],
    doubles: [
      { count: 1, level: 18 },
      { count: 1, level: 19 },
      { count: 2, level: 20 },
      { count: 2, level: 21 },
      { count: 2, level: 22 },
    ],
  },
  C: {
    singles: [
      { count: 1, level: 16 },
      { count: 1, level: 17 },
      { count: 2, level: 18 },
      { count: 2, level: 19 },
      { count: 1, level: 20 },
      { count: 1, level: 21 },
    ],
    doubles: [
      { count: 1, level: 16 },
      { count: 1, level: 17 },
      { count: 2, level: 18 },
      { count: 2, level: 19 },
      { count: 1, level: 20 },
      { count: 1, level: 21 },
    ],
  },
  D: {
    singles: [
      { count: 1, level: 10 },
      { count: 1, level: 11 },
      { count: 1, level: 12 },
      { count: 1, level: 13 },
      { count: 1, level: 14 },
      { count: 2, level: 15 },
      { count: 1, level: 16 },
    ],
    doubles: [
      { count: 1, level: 10 },
      { count: 1, level: 11 },
      { count: 1, level: 12 },
      { count: 1, level: 13 },
      { count: 1, level: 14 },
      { count: 2, level: 15 },
      { count: 1, level: 16 },
    ],
  },
};

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const pickSongs = (
  sourceSongs: Song[],
  rule: LeagueRule,
  chartType: 'single' | 'double',
  excludeIds: Set<string>
): PickedSong[] => {
  const possiblePicks: PickedSong[] = [];

  sourceSongs.forEach(song => {
    const availableLevels = song.levels[chartType];
    const matchingLevels = availableLevels.filter(level => {
      if (rule.levelSelector === 'higher') {
        return level >= rule.level;
      }
      return level === rule.level;
    });

    if (matchingLevels.length > 0) {
      // For simplicity, pick the first matching level.
      // A more complex logic could randomize this or choose based on other criteria.
      const pickedLevel = matchingLevels[0];
      if (!excludeIds.has(`${song.id}-${chartType}-${pickedLevel}`)) {
        possiblePicks.push({ ...song, selectedLevel: pickedLevel, selectedType: chartType === 'single' ? 'Single' : 'Double' });
      }
    }
  });

  const shuffled = shuffleArray(possiblePicks);
  return shuffled.slice(0, rule.count);
};

export const generateFullSession = (leagueId: string): { singleSections: { title: string; data: PickedSong[] }[]; doubleSections: { title: string; data: PickedSong[] }[] } => {
  const league = LEAGUES[leagueId];
  if (!league) {
    throw new Error(`League with id "${leagueId}" not found.`);
  }

  const selectedChartIds = new Set<string>(); // Stores unique combinations of songId-type-level
  let singlesResult: PickedSong[] = [];
  let doublesResult: PickedSong[] = [];

  // Generate Singles
  league.singles.forEach(rule => {
    const picked = pickSongs(
      songs,
      rule,
      'single',
      selectedChartIds
    );
    picked.forEach(song => {
      selectedChartIds.add(`${song.id}-${song.selectedType.toLowerCase()}-${song.selectedLevel}`);
      singlesResult.push(song);
    });
  });

  // Generate Doubles
  league.doubles.forEach(rule => {
    const picked = pickSongs(
      songs,
      rule,
      'double',
      selectedChartIds
    );
    picked.forEach(song => {
      selectedChartIds.add(`${song.id}-${song.selectedType.toLowerCase()}-${song.selectedLevel}`);
      doublesResult.push(song);
    });
  });

  // Sort results
  singlesResult.sort((a, b) => a.selectedLevel - b.selectedLevel);
  doublesResult.sort((a, b) => a.selectedLevel - b.selectedLevel);

  const groupedByLevel = (songList: PickedSong[], type: 'Single' | 'Double') => {
    return songList.reduce((acc, song) => {
      if (song.selectedType === type) {
        const key = `${type} ${song.selectedLevel}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(song);
      }
      return acc;
    }, {} as Record<string, PickedSong[]>);
  };

  const singleSections = Object.entries(groupedByLevel(singlesResult, 'Single'))
    .map(([title, data]) => ({ title, data }))
    .sort((a, b) => {
      const levelA = parseInt(a.title.split(' ')[1], 10);
      const levelB = parseInt(b.title.split(' ')[1], 10);
      return levelA - levelB;
    });

  const doubleSections = Object.entries(groupedByLevel(doublesResult, 'Double'))
    .map(([title, data]) => ({ title, data }))
    .sort((a, b) => {
        const levelA = parseInt(a.title.split(' ')[1], 10);
        const levelB = parseInt(b.title.split(' ')[1], 10);
        return levelA - levelB;
    });

  return {
    singleSections,
    doubleSections,
  };
};

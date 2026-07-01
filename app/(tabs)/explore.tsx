import React, { useMemo, useState } from 'react';
import { SectionList } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { songs, Song } from '@/data/data';
import { getBannerImage } from '@/utils/imageLoader';

type Mode = 'single' | 'double';

// Newest first; matches the versions present in the data layer.
const VERSION_ORDER = [
  'Rise',
  'Phoenix',
  'XX',
  'Prime 2',
  'Prime',
  'Fiesta 2',
  'Fiesta EX',
  'Fiesta',
  'Legacy',
];

const MODE_COLOR: Record<Mode, string> = {
  single: '#e74c3c',
  double: '#2ecc71',
};

const Screen = styled.View`
  flex: 1;
  background-color: #000;
`;

const HeaderContainer = styled.View`
  width: 100%;
  padding: 25px 20px;
  background-color: #282828;
  justify-content: center;
  align-items: center;
  border-bottom-width: 1px;
  flex-direction: row;
`;

const HeaderTitle = styled.Text`
  color: white;
  font-size: 24px;
  font-weight: bold;
`;

const ToggleRow = styled.View`
  flex-direction: row;
  padding: 12px 16px;
  background-color: #111;
`;

const ToggleButton = styled.TouchableOpacity<{ active: boolean; color: string }>`
  flex: 1;
  padding: 10px;
  margin-horizontal: 4px;
  border-radius: 8px;
  align-items: center;
  background-color: ${(props: { active: boolean; color: string }) =>
    props.active ? props.color : '#222'};
`;

const ToggleText = styled.Text<{ active: boolean }>`
  color: ${(props: { active: boolean }) => (props.active ? '#fff' : '#aaa')};
  font-size: 16px;
  font-weight: bold;
`;

const SectionHeader = styled.Text`
  background-color: #1c1c1c;
  color: #00ffff;
  font-size: 16px;
  font-weight: bold;
  padding: 8px 16px;
  text-transform: uppercase;
`;

const Row = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 10px 16px;
  border-bottom-width: 1px;
  border-bottom-color: #222;
`;

const Banner = styled.Image`
  width: 64px;
  height: 48px;
  border-radius: 4px;
`;

const RowText = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const RowTitle = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

const RowArtist = styled.Text`
  color: #999;
  font-size: 12px;
`;

const LevelRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-end;
  max-width: 130px;
`;

const LevelBadge = styled.View<{ color: string }>`
  background-color: ${(props: { color: string }) => props.color};
  border-radius: 4px;
  padding: 3px 7px;
  margin-left: 5px;
  margin-bottom: 4px;
`;

const LevelBadgeText = styled.Text`
  color: #fff;
  font-size: 13px;
  font-weight: bold;
`;

const NoLevels = styled.Text`
  color: #555;
  font-size: 16px;
  font-weight: bold;
`;

interface SongSection {
  title: string;
  data: Song[];
}

const ExploreScreen = () => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('single');

  const sections: SongSection[] = useMemo(() => {
    const byVersion = new Map<string, Song[]>();
    songs.forEach((song) => {
      const list = byVersion.get(song.version) ?? [];
      list.push(song);
      byVersion.set(song.version, list);
    });
    return VERSION_ORDER
      .filter((version) => byVersion.has(version))
      .map((version) => ({
        title: version,
        data: byVersion
          .get(version)!
          .slice()
          .sort((a, b) => a.title.localeCompare(b.title)),
      }));
  }, []);

  const handleSelectSong = (song: Song) => {
    router.push({ pathname: '/song/[songId]', params: { songId: song.id } });
  };

  return (
    <Screen>
      <HeaderContainer>
        <HeaderTitle>Explore</HeaderTitle>
      </HeaderContainer>

      <ToggleRow>
        {(['single', 'double'] as Mode[]).map((m) => (
          <ToggleButton
            key={m}
            active={mode === m}
            color={MODE_COLOR[m]}
            onPress={() => setMode(m)}
          >
            <ToggleText active={mode === m}>
              {m === 'single' ? 'Single' : 'Double'}
            </ToggleText>
          </ToggleButton>
        ))}
      </ToggleRow>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        extraData={mode}
        stickySectionHeadersEnabled
        initialNumToRender={15}
        renderSectionHeader={({ section: { title } }) => (
          <SectionHeader>{title}</SectionHeader>
        )}
        renderItem={({ item }) => {
          const levels = item.levels[mode];
          return (
            <Row onPress={() => handleSelectSong(item)}>
              <Banner source={getBannerImage(item.id)} resizeMode="contain" />
              <RowText>
                <RowTitle numberOfLines={1}>{item.title}</RowTitle>
                <RowArtist numberOfLines={1}>{item.artist}</RowArtist>
              </RowText>
              {levels.length > 0 ? (
                <LevelRow>
                  {levels.map((level, index) => (
                    <LevelBadge key={index} color={MODE_COLOR[mode]}>
                      <LevelBadgeText>{level}</LevelBadgeText>
                    </LevelBadge>
                  ))}
                </LevelRow>
              ) : (
                <NoLevels>—</NoLevels>
              )}
            </Row>
          );
        }}
      />
    </Screen>
  );
};

export default ExploreScreen;

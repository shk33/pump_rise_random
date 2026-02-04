import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { songs, Song } from '@/data/data';
import styled from 'styled-components/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getBannerImage } from '@/utils/imageLoader';

const MainContainer = styled.View`
  flex: 1;
  background-color: #000;
  padding: 20px;
`;

const ContentContainer = styled.ScrollView``;

const HeaderContainer = styled.View`
  align-items: center;
  margin-bottom: 20px; /* Add bottom margin to separate from levels */
`;

const SongBanner = styled.Image`
  width: 100%;
  height: 200px;
  resize-mode: contain;
  margin-bottom: 20px;
  border-radius: 10px;
`;

const Title = styled.Text`
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  text-align: center;
`;

const Artist = styled.Text`
  color: #aaa;
  font-size: 18px;
  margin-top: 5px;
  text-align: center;
`;

const Channel = styled.Text`
  color: #ccc;
  font-size: 16px;
  margin-top: 5px;
  text-align: center;
`;

const LevelsContainer = styled.View`
  margin-top: 10px;
`;

const LevelTypeTitle = styled.Text`
  color: #fff;
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 15px;
  border-bottom-width: 1px;
  border-bottom-color: #444;
  padding-bottom: 10px;
`;

interface LevelBadgeProps {
  chartType: 'single' | 'double';
}

const LevelRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const LevelBadge = styled.View<LevelBadgeProps>`
  background-color: ${(props) => (props.chartType === 'single' ? '#e74c3c' : '#2ecc71')};
  border-radius: 5px;
  padding: 8px 12px;
  margin-right: 10px;
  margin-bottom: 10px;
`;

const LevelText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

const TopRightCloseButton = styled.TouchableOpacity`
  position: absolute;
  top: 10px; /* Adjust for padding of MainContainer */
  right: 10px; /* Adjust for padding of MainContainer */
  padding: 10px;
  z-index: 1;
`;

const BottomCloseButton = styled.TouchableOpacity`
  background-color: #282828;
  padding: 15px;
  border-radius: 10px;
  align-items: center;
  margin-top: 20px; /* Space between scroll content and button */
`;

const BottomCloseButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const SongDetailScreen = () => {
  const { songId } = useLocalSearchParams();
  const router = useRouter();
  const song: Song | undefined = songs.find(s => s.id === songId);

  if (!song) {
    return (
      <MainContainer>
        <Text style={{ color: 'white' }}>Song not found.</Text>
      </MainContainer>
    );
  }

  const songImageSource = getBannerImage(song.id);

  return (
    <MainContainer>
      <TopRightCloseButton onPress={() => router.back()}>
        <FontAwesome5 name="times-circle" size={24} color="white" />
      </TopRightCloseButton>
      <ContentContainer>
        <HeaderContainer>
          {songImageSource && <SongBanner source={songImageSource} />}
          <Title>{song.title}</Title>
          <Artist>{song.artist}</Artist>
          <Channel>Channel: {song.category}</Channel>
        </HeaderContainer>

        {song.levels.single.length > 0 && (
          <LevelsContainer>
            <LevelTypeTitle>Singles</LevelTypeTitle>
            <LevelRow>
              {song.levels.single.map((level, index) => (
                <LevelBadge key={`single-${index}`} chartType="single">
                  <LevelText>S{level}</LevelText>
                </LevelBadge>
              ))}
            </LevelRow>
          </LevelsContainer>
        )}

        {song.levels.double.length > 0 && (
          <LevelsContainer>
            <LevelTypeTitle>Doubles</LevelTypeTitle>
            <LevelRow>
              {song.levels.double.map((level, index) => (
                <LevelBadge key={`double-${index}`} chartType="double">
                  <LevelText>D{level}</LevelText>
                </LevelBadge>
              ))}
            </LevelRow>
          </LevelsContainer>
        )}
      </ContentContainer>
      <BottomCloseButton onPress={() => router.back()}>
        <BottomCloseButtonText>Close</BottomCloseButtonText>
      </BottomCloseButton>
    </MainContainer>
  );
};

export default SongDetailScreen;


export default SongDetailScreen;
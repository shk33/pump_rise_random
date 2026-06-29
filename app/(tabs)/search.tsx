import React, { useState } from 'react';
import { FlatList, ImageBackground } from 'react-native';
import { songs, Song } from '@/data/data';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';

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

const Container = styled(ImageBackground).attrs({
  source: require('@/assets/backgrounds/we_love_your_step1.png'),
  imageStyle: { opacity: 0.1, resizeMode: 'cover' },
})`
  flex: 1;
  background-color: #000;
  padding: 20px;
`;

const SearchInput = styled.TextInput`
  background-color: #333;
  color: #fff;
  padding: 15px;
  border-radius: 5px;
  font-size: 16px;
  margin-bottom: 20px;
`;

const SongItemContainer = styled.TouchableOpacity`
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: #444;
`;

const SongTitle = styled.Text`
  color: #fff;
  font-size: 18px;
`;

const SongArtist = styled.Text`
  color: #aaa;
  font-size: 14px;
`;

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const filteredSongs = query
    ? songs.filter(song => song.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelectSong = (song: Song) => {
    router.push({ pathname: '/song/[songId]', params: { songId: song.id } });
  };

  return (
    <Screen>
      <HeaderContainer>
        <HeaderTitle>Search Songs</HeaderTitle>
      </HeaderContainer>
      <Container>
        <SearchInput
          placeholder="Search for a song..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
        />
        <FlatList
          data={filteredSongs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <SongItemContainer onPress={() => handleSelectSong(item)}>
              <SongTitle>{item.title}</SongTitle>
              <SongArtist>{item.artist}</SongArtist>
            </SongItemContainer>
          )}
        />
      </Container>
    </Screen>
  );
};

export default SearchScreen;

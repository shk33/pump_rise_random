import React from 'react';
import {
  Image,
  View,
  TouchableOpacity,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import styled from 'styled-components/native';
import { PickedSong } from '@/utils/generator';
import { getBannerImage } from '@/utils/imageLoader';
import { FontAwesome5 } from '@expo/vector-icons';


const ItemContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-vertical: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #333;
`;

const TextContainer = styled.View`
  flex: 1;
  margin-left: 16px;
`;

const TitleText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const SubtitleText = styled.Text`
  color: #ccc;
  font-size: 14px;
  text-transform: uppercase;
`;

const CategoryText = styled.Text`
  color: gray;
  font-size: 12px;
`;

const CheckboxContainer = styled.View`
  width: 48px;
  height: 48px;
  justify-content: center;
  align-items: center;
`;

interface ListItemProps {
  item: PickedSong;
}

const ListItem: React.FC<ListItemProps> = ({ item }) => {

  const handleYouTubeSearch = async () => {
    const chartPrefix = item.selectedType === 'Single' ? 'S' : 'D';
    const searchQuery = `${item.title} ${chartPrefix}${item.selectedLevel}`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

    await WebBrowser.openBrowserAsync(youtubeUrl);
  };

  return (
    <ItemContainer>
      <Image source={getBannerImage(item.id)} style={{ width: 80, height: 64, resizeMode: 'contain' }} />
      <TextContainer>
        <TitleText>{item.title}</TitleText>
        <SubtitleText>
          {item.selectedType.toUpperCase()}: {item.selectedLevel}
        </SubtitleText>
        <CategoryText>Canal: {item.version}</CategoryText>
      </TextContainer>
      <View>
        <CheckboxContainer as={TouchableOpacity} onPress={handleYouTubeSearch}>
          <FontAwesome5 name="youtube" size={24} color="#FF0000" />
        </CheckboxContainer>
      </View>
    </ItemContainer>
  );
};

export default ListItem;
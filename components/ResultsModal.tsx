import React from 'react';
import {
  Modal,
  SectionList,
  View,
} from 'react-native';
import styled from 'styled-components/native';
import { generateFullSession, PickedSong } from '../utils/generator'; // Import PickedSong
import { Song } from '../data/data';

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0,0,0,0.8);
  justify-content: flex-end;
`;

const ModalContent = styled.View`
  background-color: #1a1a1a;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  height: 80%;
  padding: 20px;
`;

const SectionHeader = styled.Text`
  font-size: 16px;
  color: gray;
  padding-vertical: 10px;
`;

const ItemContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-vertical: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #333;
`;

const BannerPlaceholder = styled.View`
  width: 80px;
  height: 64px;
  background-color: #333;
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

const IconPlaceholder = styled.View`
  width: 48px;
  height: 48px;
  background-color: #550055;
`;

const Separator = styled.View`
  height: 1px;
  background-color: #333;
`;


interface ListItemProps {
  item: PickedSong; // Use PickedSong
}

const ListItem: React.FC<ListItemProps> = ({ item }) => (
  <ItemContainer>
    {/* <Image source={{ uri: item.bannerImage }} style={{ width: 80, height: 64, resizeMode: 'contain' }} /> */}
    <BannerPlaceholder />
    <TextContainer>
      <TitleText>{item.title}</TitleText>
      <SubtitleText>
        {item.selectedType.toUpperCase()}: {item.selectedLevel}
      </SubtitleText>
      <CategoryText>Canal: {item.category}</CategoryText>
    </TextContainer>
    <IconPlaceholder />
    {/* <Image source={{ uri: item.categoryIcon }} style={{ width: 48, height: 48, resizeMode: 'contain' }} /> */}
  </ItemContainer>
);

interface ResultsModalProps {
  visible: boolean;
  onClose: () => void;
  leagueId: string;
}

const DoublesStartDividerContainer = styled.View`
  background-color: #333;
  padding-vertical: 10px;
  align-items: center;
  margin-vertical: 10px;
`;

const DoublesStartDividerText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const DoublesStartDivider = () => (
  <DoublesStartDividerContainer>
    <DoublesStartDividerText>--- DOUBLES START ---</DoublesStartDividerText>
  </DoublesStartDividerContainer>
);

const ResultsModal: React.FC<ResultsModalProps> = ({
  visible,
  onClose,
  leagueId,
}) => {
  const sections = generateFullSession(leagueId);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id + item.selectedType + item.selectedLevel}
            renderItem={({ item, section }) => {
              if (section.title === '--- DOUBLES START ---') {
                return <DoublesStartDivider />;
              }
              return <ListItem item={item} />;
            }}
            renderSectionHeader={({ section: { title } }) => {
              if (title === '--- DOUBLES START ---') {
                return null; // Hide the default header for the divider section
              }
              return <SectionHeader>{title}</SectionHeader>;
            }}
            ItemSeparatorComponent={() => <Separator />}
          />
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default ResultsModal;
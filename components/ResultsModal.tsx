import React, { useState } from 'react';
import {
  Image,
  Modal,
  SectionList,
  TouchableOpacity,
  View,
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import styled from 'styled-components/native';
import { generateFullSession, PickedSong, LEAGUE_DISPLAY_NAMES } from '@/utils/generator';
import { getBannerImage } from '@/utils/imageLoader';
import { FontAwesome } from '@expo/vector-icons';

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

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
`;

const CheckboxContainer = styled.View`
  width: 48px;
  height: 48px;
  justify-content: center;
  align-items: center;
`;

const Separator = styled.View`
  height: 1px;
  background-color: #333;
`;


interface ListItemProps {
  item: PickedSong;
}

const ListItem: React.FC<ListItemProps> = ({ item }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <ItemContainer>
      <Image source={getBannerImage(item.id)} style={{ width: 80, height: 64, resizeMode: 'contain' }} />
      <TextContainer>
        <TitleText>{item.title}</TitleText>
        <SubtitleText>
          {item.selectedType.toUpperCase()}: {item.selectedLevel}
        </SubtitleText>
        <CategoryText>Canal: {item.category}</CategoryText>
      </TextContainer>
      <View>
        <CheckboxContainer>
          <Checkbox
            status={isChecked ? 'checked' : 'unchecked'}
            onPress={() => setIsChecked(!isChecked)}
          />
        </CheckboxContainer>
      </View>
    </ItemContainer>
  );
};

interface ResultsModalProps {
  visible: boolean;
  onClose: () => void;
  leagueId: string;
}

type ResultSection = {
  title: string;
  data: PickedSong[];
};

const ListDivider = styled.View`
  background-color: darkgreen;
  height: 2px;
  margin-vertical: 20px;
`;


const ModalTitle = styled.Text`
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
`;


const ResultsModal: React.FC<ResultsModalProps> = ({
  visible,
  onClose,
  leagueId,
}) => {
  const { singleSections, doubleSections } = generateFullSession(leagueId);

  const sections: ResultSection[] = [
    ...singleSections,
  ];

  if (doubleSections.length > 0) {
    sections.push({ title: 'DOUBLES_DIVIDER', data: [] }); // Special divider section
    sections.push(...doubleSections);
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <Header>
            <ModalTitle>{LEAGUE_DISPLAY_NAMES[leagueId] || `${leagueId.toUpperCase()} League`}</ModalTitle>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="close" size={24} color="white" />
            </TouchableOpacity>
          </Header>

          <SectionList
            sections={sections} // Use the combined sections with level grouping
            keyExtractor={(item) => item.id + item.selectedType + item.selectedLevel}
            renderItem={({ item }) => <ListItem item={item} />}
            renderSectionHeader={({ section: { title } }) => {
              if (title === 'DOUBLES_DIVIDER') {
                return (
                  <>
                    <ListDivider />
                  </>
                );
              }
              // This will now correctly render "Single X" and "Double Y" headers
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
import React from 'react';
import {
  ImageBackground,
  SectionList,
  TouchableOpacity,
  View,
} from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import styled from 'styled-components/native';
import { generateFullSession, LEAGUE_DISPLAY_NAMES } from '@/utils/generator';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LEAGUE_COLORS } from '@/constants/LeagueColors';
import ListItem from '@/components/ListItem';



const Header = styled(LinearGradient).attrs({
  start: { x: 0, y: 0.5 },
  end: { x: 1, y: 0.5 },
})`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  height: 90px;
  padding-horizontal: 15px;
`;

const SectionHeader = styled.Text`
  font-size: 16px;
  color: gray;
  padding-vertical: 10px;
`;













const Separator = styled.View`
  height: 1px;
  background-color: #333;
`;




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
`;


const ResultsModal: React.FC<ResultsModalProps> = ({
  visible,
  onClose,
  leagueId,
}) => {
  const { singleSections, doubleSections } = generateFullSession(leagueId);
  const headerColors = LEAGUE_COLORS[leagueId] || LEAGUE_COLORS['D'];

  const sections: ResultSection[] = [
    ...singleSections,
  ];

  if (doubleSections.length > 0) {
    sections.push({ title: 'DOUBLES_DIVIDER', data: [] });
    sections.push(...doubleSections);
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={{
          backgroundColor: '#1a1a1a',
          height: '80%',
          paddingBottom: 20,
          justifyContent: 'flex-end',
          marginHorizontal: 0,
          marginBottom: 0,
          marginTop: 'auto',
        }}
      >
        <Header colors={headerColors}>
          <ModalTitle>{LEAGUE_DISPLAY_NAMES[leagueId] || `${leagueId.toUpperCase()} League`}</ModalTitle>
          <TouchableOpacity onPress={onClose}>
            <FontAwesome name="close" size={24} color="white" />
          </TouchableOpacity>
        </Header>

        <ImageBackground
          source={require('@/assets/backgrounds/we_love_your_step1.png')}
          style={{ flex: 1 }}
          imageStyle={{ opacity: 0.06, resizeMode: 'cover' }}
        >
          <SectionList
            sections={sections}
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
              return <SectionHeader>{title}</SectionHeader>;
            }}
            ItemSeparatorComponent={() => <Separator />}
            contentContainerStyle={{ padding: 15 }}
          />
        </ImageBackground>
      </Modal>
    </Portal>
  );
};


export default ResultsModal;
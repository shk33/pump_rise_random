import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import styled from 'styled-components/native';
import LeagueSelectionModal from '../components/LeagueSelectionModal';
import ResultsModal from '../components/ResultsModal';

const Container = styled.View`
  flex: 1;
  background-color: black;
  align-items: center;
  padding-top: 50px;
`;

const Header = styled.Text`
  color: white;
  font-size: 20px;
  align-self: flex-start;
  margin-left: 20px;
`;

const MainContent = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const DotBarContainer = styled.View`
  flex-direction: row;
  margin-vertical: 20px;
`;

const Dot = styled.View`
  width: 5px;
  height: 5px;
  border-radius: 2.5px;
  background-color: #00ffff;
  margin-horizontal: 3px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SideButton = styled.TouchableOpacity`
  width: 100px;
  height: 100px;
  justify-content: center;
  align-items: center;
  border-color: #008f8f;
  border-width: 2px;
  margin-horizontal: 10px;
`;

const CenterButton = styled(LinearGradient)`
  width: 150px;
  height: 150px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const ButtonTextSmall = styled.Text`
  color: white;
  font-weight: bold;
`;

const ButtonTextLarge = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 20px;
  text-align: center;
`;

const DotBar = () => (
  <DotBarContainer>
    {Array.from({ length: 20 }).map((_, i) => (
      <Dot key={i} />
    ))}
  </DotBarContainer>
);

export default function HomeScreen() {
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState('');

  const handleSelectLeague = (leagueId: string) => {
    setSelectedLeagueId(leagueId);
    setResultsModalVisible(true);
  };

  return (
    <Container>
      <Header>Pump it up Random</Header>

      <MainContent>
        <DotBar />

        <ButtonRow>
          <SideButton>
            <ButtonTextSmall>RANDOM MODE</ButtonTextSmall>
          </SideButton>

          <TouchableOpacity onPress={() => setLeagueModalVisible(true)}>
            <CenterButton colors={['#00ffff', '#008f8f']}>
              <ButtonTextLarge>TRAINING</ButtonTextLarge>
              <ButtonTextLarge>MODE</ButtonTextLarge>
            </CenterButton>
          </TouchableOpacity>

          <SideButton>
            <FontAwesome5 name="lock" size={24} color="gray" />
          </SideButton>
        </ButtonRow>

        <DotBar />
      </MainContent>

      <LeagueSelectionModal
        visible={leagueModalVisible}
        onClose={() => setLeagueModalVisible(false)}
        onSelectLeague={handleSelectLeague}
      />

      {selectedLeagueId && (
        <ResultsModal
          visible={resultsModalVisible}
          onClose={() => setResultsModalVisible(false)}
          leagueId={selectedLeagueId}
        />
      )}
    </Container>
  );
}
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import styled from 'styled-components/native';
import LeagueSelectorList from '../components/LeagueSelectorList';
import ResultsModal from '../components/ResultsModal';

const BackgroundImage = require('../assets/backgrounds/pump_logo.png');

const Container = styled.View`
  flex: 1;
  background-color: black; /* Fallback background color */
  align-items: center;
  padding-top: 5px;
`;

const HeaderContainer = styled.View`
  width: 100%;
  padding: 25px 20px; /* Vertical and horizontal padding */
  background-color: #282828; /* Slightly lighter dark gray */
  justify-content: center;
  align-items: center;
  border-bottom-width: 1px; /* Add a bottom border */
`;

const HeaderTitle = styled.Text`
  color: white;
  font-size: 24px; /* Slightly larger font */
  font-weight: bold; /* Make it bold */
`;

const MainContent = styled.View`
  flex: 1;
  width: 100%;
  margin-top: -22px;
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
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState('');

  const handleSelectLeague = (leagueId: string) => {
    setSelectedLeagueId(leagueId);
    setResultsModalVisible(true);
  };

  return (
    <Container>
      <HeaderContainer>
        <HeaderTitle>
          PIU: Rise - Random
        </HeaderTitle>
      </HeaderContainer>

      <MainContent>
        <LeagueSelectorList onSelectLeague={handleSelectLeague} />
      </MainContent>

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
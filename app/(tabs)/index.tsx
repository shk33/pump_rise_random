import React, { useState } from 'react';
import styled from 'styled-components/native';
import LeagueSelectorList from '@/components/LeagueSelectorList';
import ResultsModal from '@/components/ResultsModal';

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
  flex-direction: row;
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

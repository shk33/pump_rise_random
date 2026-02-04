import { View, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { LEAGUE_COLORS } from '@/constants/LeagueColors';

interface LeagueSelectorListProps {
  onSelectLeague: (leagueId: string) => void;
}

const ListContainer = styled(ImageBackground)`
  flex: 1;
  padding: 20px;
  background-color: #1a1a1a;
  margin-top: 20px;
`;

const Header = styled(ImageBackground)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  height: 80px; /* Added fixed height */
`;

const Title = styled.Text`
  color: white;
  font-size: 20px; /* Made smaller */
  font-weight: bold;
`;

const BodyText = styled.Text`
  color: #ccc;
  font-size: 14px;
  margin-bottom: 20px;
`;

const LeagueButtonStyled = styled(LinearGradient)`
  padding: 15px;
  border-radius: 15px;
  margin-bottom: 25px;
`;

const LeagueButtonText = styled.Text`
  color: #FFFFFF;
  font-size: 22px;
  font-weight: bold;
  text-align: center;
`;

const LeagueButton = ({ colors, text, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <LeagueButtonStyled colors={colors}>
      <LeagueButtonText>{text}</LeagueButtonText>
    </LeagueButtonStyled>
  </TouchableOpacity>
);

export default function LeagueSelectorList({ onSelectLeague }: LeagueSelectorListProps) {
  const handleSelectLeague = (leagueId: string) => {
    onSelectLeague(leagueId);
  };

  return (
    <ListContainer
      source={require('../assets/backgrounds/rise_city.jpg')}
      resizeMode="cover"
      imageStyle={{ opacity: 0.25 }}
    >
      <Title>Select Your League</Title>

      <BodyText>
        Includes: Arcade and Remix Songs
      </BodyText>

      <LeagueButton
        colors={LEAGUE_COLORS['SSS']}
        text="League - SSS"
        onPress={() => handleSelectLeague('SSS')}
      />
      <LeagueButton
        colors={LEAGUE_COLORS['S']}
        text="League - S"
        onPress={() => handleSelectLeague('S')}
      />
      <LeagueButton
        colors={LEAGUE_COLORS['A']}
        text="League - A"
        onPress={() => handleSelectLeague('A')}
      />
      <LeagueButton
        colors={LEAGUE_COLORS['B']}
        text="League - B"
        onPress={() => handleSelectLeague('B')}
      />
      <LeagueButton
        colors={LEAGUE_COLORS['C']}
        text="League - C"
        onPress={() => handleSelectLeague('C')}
      />
      <LeagueButton
        colors={LEAGUE_COLORS['D']}
        text="League - D"
        onPress={() => handleSelectLeague('D')}
      />
    </ListContainer>
  );
}
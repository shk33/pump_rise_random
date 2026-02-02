import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import styled from 'styled-components/native';

interface LeagueSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLeague: (leagueId: string) => void;
}


const ModalContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const ModalContent = styled.View`
  background-color: #1a1a1a;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.Text`
  color: white;
  font-size: 24px;
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
  margin-bottom: 10px;
`;

const LeagueButtonText = styled.Text`
  color: white;
  font-size: 18px;
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

export default function LeagueSelectionModal({ visible, onClose, onSelectLeague }: LeagueSelectionModalProps) {
  const handleSelectLeague = (leagueId: string) => {
    onSelectLeague(leagueId);
    onClose();
  };

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
            <Title>Random Lists</Title>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="close" size={24} color="white" />
            </TouchableOpacity>
          </Header>

          <BodyText>
            Default options: Only Songs...
          </BodyText>

          <LeagueButton
            colors={['#ff416c', '#ff4b2b']}
            text="League - SSS"
            onPress={() => handleSelectLeague('SSS')}
          />
          <LeagueButton
            colors={['#ff9966', '#ff5e62']}
            text="League - S"
            onPress={() => handleSelectLeague('S')}
          />
          <LeagueButton
            colors={['#f7971e', '#ffd200']}
            text="League - A"
            onPress={() => handleSelectLeague('A')}
          />
          <LeagueButton
            colors={['#cddc39', '#ffeb3b']}
            text="League - B"
            onPress={() => handleSelectLeague('B')}
          />
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
}
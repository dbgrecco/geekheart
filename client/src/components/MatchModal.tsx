import React from 'react';
import { Modal, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { User } from '../types';
import { Colors } from '../theme/colors';
import { getImageUrl } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

interface MatchModalProps {
  visible: boolean;
  currentUser: User | null;
  matchedUser: User | null;
  matchId: string | null;
  onSendMessage: (matchId: string, matchedUser: User) => void;
  onClose: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  currentUser,
  matchedUser,
  matchId,
  onSendMessage,
  onClose,
}) => {
  if (!matchedUser) return null;

  const myImage = getImageUrl(currentUser?.image) || 'https://via.placeholder.com/150';
  const partnerImage = getImageUrl(matchedUser.image) || 'https://via.placeholder.com/150';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.matchTitle}>⚡ É UM MATCH GEEK! ⚡</Text>
          <Text style={styles.matchSubtitle}>
            Você e <Text style={styles.highlightName}>{matchedUser.name}</Text> se curtiram!
          </Text>

          {/* Avatares dos dois perfis com badge centralizado */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: myImage }} style={[styles.avatar, styles.leftAvatar]} />
            <View style={styles.heartIconCircle}>
              <Ionicons name="heart" size={28} color={Colors.primary} />
            </View>
            <Image source={{ uri: partnerImage }} style={[styles.avatar, styles.rightAvatar]} />
          </View>

          {/* Botões de Ação */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              if (matchId) {
                onSendMessage(matchId, matchedUser);
              }
            }}
          >
            <Ionicons name="chatbubbles" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Mandar Mensagem Agora</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Continuar Navegando</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 10,
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  matchSubtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 28,
  },
  highlightName: {
    color: Colors.secondary,
    fontWeight: 'bold',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    width: '100%',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.secondary,
  },
  leftAvatar: {
    marginRight: -15,
  },
  rightAvatar: {
    marginLeft: -15,
  },
  heartIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    zIndex: 10,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MatchModal;

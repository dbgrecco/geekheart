import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import MatchModal from '../components/MatchModal';
import { User } from '../types';
import { Colors } from '../theme/colors';
import { apiFetch } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }: any) => {
  const { user: currentUser, token } = useAuth();
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Match Modal state
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);

  const swiperRef = useRef<any>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/profiles', {}, token);
      setProfiles(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfiles();
    }
  }, [token]);

  const sendInteraction = async (cardIndex: number, liked: boolean) => {
    const targetProfile = profiles[cardIndex];
    if (!targetProfile) return;

    try {
      const data = await apiFetch(
        '/api/interactions',
        {
          method: 'POST',
          body: JSON.stringify({ targetUserId: targetProfile.id, liked }),
        },
        token
      );

      if (data.match) {
        setMatchedUser(data.targetUser || targetProfile);
        setMatchId(data.matchId);
        setMatchModalVisible(true);
      }
    } catch (err) {
      console.error('Failed to send interaction', err);
    }
  };

  const handleSwipeRight = (cardIndex: number) => {
    sendInteraction(cardIndex, true);
  };

  const handleSwipeLeft = (cardIndex: number) => {
    sendInteraction(cardIndex, false);
  };

  const handleSendMessage = (targetMatchId: string, partner: User) => {
    setMatchModalVisible(false);
    navigation.navigate('MatchesStack', {
      screen: 'Chat',
      params: { matchId: targetMatchId, partner },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Procurando perfis compatíveis...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={56} color={Colors.danger} />
        <Text style={styles.errorText}>Erro: {error}</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={fetchProfiles}>
          <Text style={styles.reloadButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Ionicons name="heart" size={28} color={Colors.primary} />
          <Text style={styles.brandTitle}>HeartGeek</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={fetchProfiles}>
          <Ionicons name="refresh" size={22} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Swiper Deck ou Empty State */}
      {profiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="planet-outline" size={60} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Você explorou toda a galáxia!</Text>
          <Text style={styles.emptySubtitle}>Não há mais perfis novos no momento. Volte mais tarde ou recarregue.</Text>
          <TouchableOpacity style={styles.reloadButton} onPress={fetchProfiles}>
            <Ionicons name="refresh-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.reloadButtonText}>Recarregar Radar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.swiperWrapper}>
          <Swiper
            ref={swiperRef}
            cards={profiles}
            renderCard={(card: User) => card ? <ProfileCard profile={card} /> : null}
            onSwipedRight={handleSwipeRight}
            onSwipedLeft={handleSwipeLeft}
            onSwipedAll={() => setProfiles([])}
            cardIndex={0}
            backgroundColor={'transparent'}
            stackSize={3}
            stackSeparation={14}
            verticalSwipe={false}
            overlayLabels={{
              left: {
                title: 'PASS',
                style: {
                  label: { backgroundColor: Colors.danger, color: '#FFF', fontSize: 22, fontWeight: 'bold' },
                  wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 30, marginLeft: -30 },
                },
              },
              right: {
                title: 'MATCH!',
                style: {
                  label: { backgroundColor: Colors.primary, color: '#FFF', fontSize: 22, fontWeight: 'bold' },
                  wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 30, marginLeft: 30 },
                },
              },
            }}
          />

          {/* Controls Bar */}
          <View style={styles.controlsBar}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.dislikeBtn]}
              onPress={() => swiperRef.current?.swipeLeft()}
            >
              <Ionicons name="close" size={30} color={Colors.danger} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.likeBtn]}
              onPress={() => swiperRef.current?.swipeRight()}
            >
              <Ionicons name="heart" size={34} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Match Modal */}
      <MatchModal
        visible={matchModalVisible}
        currentUser={currentUser}
        matchedUser={matchedUser}
        matchId={matchId}
        onSendMessage={handleSendMessage}
        onClose={() => setMatchModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: Colors.textMuted,
    marginTop: 16,
    fontSize: 15,
  },
  errorText: {
    color: Colors.text,
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  reloadButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  reloadButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  swiperWrapper: {
    flex: 1,
  },
  controlsBar: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dislikeBtn: {
    borderColor: 'rgba(255, 23, 68, 0.4)',
  },
  likeBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderColor: 'rgba(255, 42, 133, 0.5)',
    backgroundColor: Colors.surfaceLight,
  },
});

export default HomeScreen;

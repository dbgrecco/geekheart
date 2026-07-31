import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Match } from '../types';
import { Colors } from '../theme/colors';
import { apiFetch, getImageUrl } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

const MatchesScreen = ({ navigation }: any) => {
  const { token } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = async () => {
    try {
      const data = await apiFetch('/api/matches', {}, token);
      setMatches(data);
    } catch (err) {
      console.error('Failed to fetch matches', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMatches();
    }
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const renderNewMatchesHeader = () => {
    if (matches.length === 0) return null;

    return (
      <View style={styles.newMatchesSection}>
        <Text style={styles.sectionTitle}>Novos Matches ⚡</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={matches}
          keyExtractor={(item) => `new-${item.id}`}
          renderItem={({ item }) => {
            const partner = item.user;
            const imageUrl = getImageUrl(partner?.image) || 'https://via.placeholder.com/150';
            return (
              <TouchableOpacity
                style={styles.newMatchAvatarContainer}
                onPress={() => navigation.navigate('Chat', { matchId: item.id, partner })}
              >
                <View style={styles.avatarBorder}>
                  <Image source={{ uri: imageUrl }} style={styles.newMatchAvatar} />
                  {partner?.isOnline && <View style={styles.onlineBadge} />}
                </View>
                <Text style={styles.newMatchName} numberOfLines={1}>
                  {partner?.name || 'Geek'}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches & Conversas</Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBadge}>
            <Ionicons name="chatbubbles-outline" size={54} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Nenhum Match por enquanto</Text>
          <Text style={styles.emptySubtitle}>
            Continue explorando perfis na aba Home para encontrar pessoas com os mesmos interesses!
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderNewMatchesHeader}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => {
            const partner = item.user;
            const imageUrl = getImageUrl(partner?.image) || 'https://via.placeholder.com/150';
            const lastMsg = item.lastMessage;

            return (
              <TouchableOpacity
                style={styles.matchItem}
                onPress={() => navigation.navigate('Chat', { matchId: item.id, partner })}
              >
                <View style={styles.avatarWrapper}>
                  <Image source={{ uri: imageUrl }} style={styles.avatar} />
                  {partner?.isOnline && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.matchDetails}>
                  <View style={styles.matchNameRow}>
                    <Text style={styles.matchName}>{partner?.name}</Text>
                    {lastMsg?.createdAt && (
                      <Text style={styles.matchTime}>
                        {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    )}
                  </View>

                  <Text style={[styles.lastMessageText, lastMsg && !lastMsg.isRead && styles.unreadText]} numberOfLines={1}>
                    {lastMsg ? lastMsg.text : 'Comece a conversa agora! 🎉'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newMatchesSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  newMatchAvatarContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  avatarBorder: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  newMatchAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  newMatchName: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 43, 69, 0.5)',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  matchDetails: {
    flex: 1,
  },
  matchNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  matchTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  lastMessageText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  unreadText: {
    color: Colors.secondary,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MatchesScreen;

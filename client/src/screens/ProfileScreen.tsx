import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { getImageUrl } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  const imageUrl = getImageUrl(user?.image) || 'https://via.placeholder.com/200';

  const openSocial = (type: string, handleOrUrl?: string | null) => {
    if (!handleOrUrl) return;
    let url = handleOrUrl;
    if (type === 'instagram') {
      url = `https://instagram.com/${handleOrUrl.replace('@', '').trim()}`;
    } else if (type === 'twitter') {
      url = `https://x.com/${handleOrUrl.replace('@', '').trim()}`;
    } else if (type === 'tiktok') {
      url = `https://tiktok.com/@${handleOrUrl.replace('@', '').trim()}`;
    } else if (type === 'spotify' && !handleOrUrl.startsWith('http')) {
      url = `https://open.spotify.com/user/${handleOrUrl.trim()}`;
    } else if (type === 'facebook' && !handleOrUrl.startsWith('http')) {
      url = `https://facebook.com/${handleOrUrl.trim()}`;
    }
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header do Perfil com Avatar Glow */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarGlowContainer}>
            <Image source={{ uri: imageUrl }} style={styles.avatar} />
          </View>

          <Text style={styles.name}>
            {user?.name || 'Seu Nome'}
            {user?.age ? `, ${user.age}` : ''}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>

          {/* Localização & Modo Viagem */}
          <View style={styles.locationBadgeContainer}>
            <Ionicons
              name={user?.isTravelMode ? 'airplane' : 'location'}
              size={16}
              color={user?.isTravelMode ? Colors.secondary : Colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.locationBadgeText}>
              {user?.isTravelMode
                ? `Modo Viagem: ${user.travelLocationName || 'Ativo'}`
                : user?.locationName || 'Localização Atual'}
            </Text>
          </View>
        </View>

        {/* Redes Sociais Conectadas */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Conexões Sociais</Text>
            <Text style={styles.privacyTag}>
              {user?.showSocials !== false ? '🌐 Visível no Perfil' : '🔒 Privado'}
            </Text>
          </View>

          <View style={styles.socialsGrid}>
            {user?.spotifyUrl ? (
              <TouchableOpacity style={[styles.socialPill, { borderColor: '#1DB954' }]} onPress={() => openSocial('spotify', user.spotifyUrl)}>
                <Ionicons name="musical-note" size={18} color="#1DB954" style={{ marginRight: 6 }} />
                <Text style={styles.socialPillText}>Spotify</Text>
              </TouchableOpacity>
            ) : null}

            {user?.instagramHandle ? (
              <TouchableOpacity style={[styles.socialPill, { borderColor: '#E1306C' }]} onPress={() => openSocial('instagram', user.instagramHandle)}>
                <Ionicons name="logo-instagram" size={18} color="#E1306C" style={{ marginRight: 6 }} />
                <Text style={styles.socialPillText}>{user.instagramHandle}</Text>
              </TouchableOpacity>
            ) : null}

            {user?.twitterHandle ? (
              <TouchableOpacity style={[styles.socialPill, { borderColor: '#1DA1F2' }]} onPress={() => openSocial('twitter', user.twitterHandle)}>
                <Ionicons name="logo-twitter" size={18} color="#1DA1F2" style={{ marginRight: 6 }} />
                <Text style={styles.socialPillText}>{user.twitterHandle}</Text>
              </TouchableOpacity>
            ) : null}

            {user?.tiktokHandle ? (
              <TouchableOpacity style={[styles.socialPill, { borderColor: '#00F0FF' }]} onPress={() => openSocial('tiktok', user.tiktokHandle)}>
                <Ionicons name="musical-notes-outline" size={18} color="#00F0FF" style={{ marginRight: 6 }} />
                <Text style={styles.socialPillText}>{user.tiktokHandle}</Text>
              </TouchableOpacity>
            ) : null}

            {user?.facebookUrl ? (
              <TouchableOpacity style={[styles.socialPill, { borderColor: '#1877F2' }]} onPress={() => openSocial('facebook', user.facebookUrl)}>
                <Ionicons name="logo-facebook" size={18} color="#1877F2" style={{ marginRight: 6 }} />
                <Text style={styles.socialPillText}>Facebook</Text>
              </TouchableOpacity>
            ) : null}

            {!user?.spotifyUrl && !user?.instagramHandle && !user?.twitterHandle && !user?.tiktokHandle && !user?.facebookUrl && (
              <Text style={styles.emptyText}>Nenhuma rede social conectada. Toque em Editar para vincular!</Text>
            )}
          </View>
        </View>

        {/* Biografia */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sua Biografia Geek</Text>
          <Text style={styles.bioText}>
            {user?.bio ? user.bio : 'Nenhuma biografia adicionada ainda. Toque em Editar para contar sua história!'}
          </Text>
        </View>

        {/* Interesses Geek */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Interesses Geek</Text>
          {user?.interests && user.interests.length > 0 ? (
            <View style={styles.interestsGrid}>
              {user.interests.map((interest, idx) => (
                <View key={idx} style={styles.chip}>
                  <Text style={styles.chipText}>{interest}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyInterestsText}>Nenhum interesse selecionado.</Text>
          )}
        </View>

        {/* Vertentes Musicais & Trilhas */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Músicas & Trilhas Sonoras</Text>
          {user?.musicGenres && user.musicGenres.length > 0 ? (
            <View style={styles.interestsGrid}>
              {user.musicGenres.map((genre, idx) => (
                <View key={idx} style={[styles.chip, styles.musicChip]}>
                  <Text style={[styles.chipText, styles.musicChipText]}>{genre}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyInterestsText}>Nenhum estilo musical selecionado.</Text>
          )}
        </View>

        {/* Ações */}
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="create-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.editButtonText}>Editar Perfil & Conexões</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarGlowContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
    padding: 3,
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
    backgroundColor: Colors.surface,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  email: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  locationBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationBadgeText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  privacyTag: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
  },
  socialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  socialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  socialPillText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  bioText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  emptyInterestsText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    color: Colors.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  musicChip: {
    borderColor: 'rgba(0, 240, 255, 0.4)',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  musicChipText: {
    color: Colors.secondary,
  },
  editButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 23, 68, 0.1)',
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 23, 68, 0.3)',
  },
  logoutButtonText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

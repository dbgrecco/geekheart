import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Linking, TouchableWithoutFeedback } from 'react-native';
import { User } from '../types';
import { Colors } from '../theme/colors';
import { getImageUrl } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

interface ProfileCardProps {
  profile: User;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const [photoIndex, setPhotoIndex] = useState(0);

  // Lista de fotos: combina foto principal + fotos da galeria
  const allPhotos: string[] = [];
  if (profile.photos && profile.photos.length > 0) {
    profile.photos.forEach(p => {
      const url = getImageUrl(p.url);
      if (url) allPhotos.push(url);
    });
  }
  if (allPhotos.length === 0) {
    const mainUrl = getImageUrl(profile.image) || 'https://via.placeholder.com/600x800/1A1829/FF2A85?text=HeartGeek';
    allPhotos.push(mainUrl);
  }

  const currentPhotoUrl = allPhotos[photoIndex] || allPhotos[0];
  const compatibility = profile.compatibility || 75;

  const handleNextPhoto = () => {
    if (photoIndex < allPhotos.length - 1) {
      setPhotoIndex(photoIndex + 1);
    } else {
      setPhotoIndex(0);
    }
  };

  const handlePrevPhoto = () => {
    if (photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
    } else {
      setPhotoIndex(allPhotos.length - 1);
    }
  };

  const locationLabel = profile.isTravelMode
    ? `✈️ ${profile.travelLocationName || 'Modo Viagem'}`
    : profile.distanceKm != null
    ? `📍 a ${profile.distanceKm} km`
    : profile.locationName
    ? `📍 ${profile.locationName}`
    : null;

  const openSocialLink = (type: string, handleOrUrl?: string | null) => {
    if (!handleOrUrl) return;
    let url = handleOrUrl;
    if (type === 'instagram') {
      const clean = handleOrUrl.replace('@', '').trim();
      url = `https://instagram.com/${clean}`;
    } else if (type === 'twitter') {
      const clean = handleOrUrl.replace('@', '').trim();
      url = `https://x.com/${clean}`;
    } else if (type === 'tiktok') {
      const clean = handleOrUrl.replace('@', '').trim();
      url = `https://tiktok.com/@${clean}`;
    } else if (type === 'spotify' && !handleOrUrl.startsWith('http')) {
      url = `https://open.spotify.com/user/${handleOrUrl.trim()}`;
    } else if (type === 'steam' && !handleOrUrl.startsWith('http')) {
      url = `https://steamcommunity.com/id/${handleOrUrl.trim()}`;
    } else if (type === 'facebook' && !handleOrUrl.startsWith('http')) {
      url = `https://facebook.com/${handleOrUrl.trim()}`;
    }
    Linking.openURL(url).catch(() => {});
  };

  const showSocials = profile.showSocials !== false;

  return (
    <View style={styles.card}>
      <Image source={{ uri: currentPhotoUrl }} style={styles.image} resizeMode="cover" />

      {/* Overlay com degradê escuro */}
      <View style={styles.gradientOverlay} />

      {/* Áreas de toque para navegar fotos */}
      {allPhotos.length > 1 && (
        <View style={styles.touchNavigationOverlay} pointerEvents="box-none">
          <TouchableOpacity style={styles.touchSide} onPress={handlePrevPhoto} activeOpacity={0.9} />
          <TouchableOpacity style={styles.touchSide} onPress={handleNextPhoto} activeOpacity={0.9} />
        </View>
      )}

      {/* Indicadores de Fotos Superior */}
      {allPhotos.length > 1 && (
        <View style={styles.photoIndicatorsRow}>
          {allPhotos.map((_, idx) => (
            <View
              key={`ph-${idx}`}
              style={[
                styles.photoIndicatorBar,
                idx === photoIndex ? styles.photoIndicatorActive : styles.photoIndicatorInactive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Badges Superiores */}
      <View style={styles.topBadgesRow}>
        <View style={styles.compatibilityBadge}>
          <Text style={styles.compatibilityText}>⚡ {compatibility}% COMPATIBILIDADE</Text>
        </View>

        {profile.rpgClass && (
          <View style={styles.rpgBadge}>
            <Text style={styles.rpgText}>🛡️ {profile.rpgClass}</Text>
          </View>
        )}

        {locationLabel && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{locationLabel}</Text>
          </View>
        )}
      </View>

      {/* Conteúdo Informativo do Perfil */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>
            {profile.name}
            {profile.age ? `, ${profile.age}` : ''}
          </Text>
          {profile.isOnline && (
            <View style={styles.onlineTag}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          )}
        </View>

        {profile.bio ? <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text> : null}

        {/* Barra de Redes Sociais Conectadas */}
        {showSocials && (
          <View style={styles.socialsRow}>
            {profile.steamId ? (
              <TouchableOpacity style={[styles.socialIconBtn, { borderColor: '#171A21' }]} onPress={() => openSocialLink('steam', profile.steamId)}>
                <Ionicons name="game-controller" size={16} color="#00F0FF" />
              </TouchableOpacity>
            ) : null}

            {profile.spotifyUrl ? (
              <TouchableOpacity style={[styles.socialIconBtn, { borderColor: '#1DB954' }]} onPress={() => openSocialLink('spotify', profile.spotifyUrl)}>
                <Ionicons name="musical-note" size={16} color="#1DB954" />
              </TouchableOpacity>
            ) : null}

            {profile.instagramHandle ? (
              <TouchableOpacity style={[styles.socialIconBtn, { borderColor: '#E1306C' }]} onPress={() => openSocialLink('instagram', profile.instagramHandle)}>
                <Ionicons name="logo-instagram" size={16} color="#E1306C" />
              </TouchableOpacity>
            ) : null}

            {profile.twitterHandle ? (
              <TouchableOpacity style={[styles.socialIconBtn, { borderColor: '#1DA1F2' }]} onPress={() => openSocialLink('twitter', profile.twitterHandle)}>
                <Ionicons name="logo-twitter" size={16} color="#1DA1F2" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Interesses & Jogos Geek */}
        <View style={styles.tagsContainer}>
          {profile.favoriteGames && profile.favoriteGames.length > 0 && (
            profile.favoriteGames.slice(0, 2).map((game, idx) => (
              <View key={`g-${idx}`} style={[styles.chip, styles.gameChip]}>
                <Text style={[styles.chipText, styles.gameChipText]}>🎮 {game}</Text>
              </View>
            ))
          )}

          {profile.favoriteAnimes && profile.favoriteAnimes.length > 0 && (
            profile.favoriteAnimes.slice(0, 2).map((anime, idx) => (
              <View key={`a-${idx}`} style={[styles.chip, styles.animeChip]}>
                <Text style={[styles.chipText, styles.animeChipText]}>🍥 {anime}</Text>
              </View>
            ))
          )}

          {profile.interests && profile.interests.length > 0 && (
            profile.interests.slice(0, 2).map((interest, idx) => (
              <View key={`int-${idx}`} style={styles.chip}>
                <Text style={styles.chipText}>{interest}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 14, 23, 0.45)',
  },
  touchNavigationOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 180,
    flexDirection: 'row',
  },
  touchSide: {
    flex: 1,
  },
  photoIndicatorsRow: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  photoIndicatorBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  photoIndicatorActive: {
    backgroundColor: Colors.secondary,
  },
  photoIndicatorInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  compatibilityBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  compatibilityText: {
    color: Colors.secondary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  rpgBadge: {
    backgroundColor: 'rgba(123, 44, 191, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  rpgText: {
    color: '#D8B4FE',
    fontWeight: 'bold',
    fontSize: 12,
  },
  distanceBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  distanceText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(15, 14, 23, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 42, 133, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  onlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  onlineText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  bio: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 10,
  },
  socialsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  socialIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  gameChip: {
    borderColor: 'rgba(255, 42, 133, 0.4)',
    backgroundColor: 'rgba(255, 42, 133, 0.1)',
  },
  gameChipText: {
    color: Colors.primary,
  },
  animeChip: {
    borderColor: 'rgba(0, 240, 255, 0.4)',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  animeChipText: {
    color: Colors.secondary,
  },
});

export default ProfileCard;

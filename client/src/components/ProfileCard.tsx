import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { User } from '../types';
import { Colors } from '../theme/colors';
import { getImageUrl } from '../config/api';

interface ProfileCardProps {
  profile: User;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const imageUrl = getImageUrl(profile.image) || 'https://via.placeholder.com/600x800/1A1829/FF2A85?text=HeartGeek';
  const compatibility = profile.compatibility || 75;

  const locationLabel = profile.isTravelMode
    ? `✈️ ${profile.travelLocationName || 'Modo Viagem'}`
    : profile.distanceKm != null
    ? `📍 a ${profile.distanceKm} km`
    : profile.locationName
    ? `📍 ${profile.locationName}`
    : null;

  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

      {/* Overlay com degradê escuro */}
      <View style={styles.gradientOverlay} />

      {/* Badges Superiores */}
      <View style={styles.topBadgesRow}>
        <View style={styles.compatibilityBadge}>
          <Text style={styles.compatibilityText}>⚡ {compatibility}% GEEK MATCH</Text>
        </View>

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

        {/* Interesses Geek */}
        {profile.interests && profile.interests.length > 0 && (
          <View style={styles.tagsContainer}>
            {profile.interests.slice(0, 3).map((interest, idx) => (
              <View key={`int-${idx}`} style={styles.chip}>
                <Text style={styles.chipText}>{interest}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Vertentes Musicais & Trilhas */}
        {profile.musicGenres && profile.musicGenres.length > 0 && (
          <View style={styles.tagsContainer}>
            {profile.musicGenres.slice(0, 3).map((genre, idx) => (
              <View key={`mus-${idx}`} style={[styles.chip, styles.musicChip]}>
                <Text style={[styles.chipText, styles.musicChipText]}>{genre}</Text>
              </View>
            ))}
          </View>
        )}
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
  topBadgesRow: {
    position: 'absolute',
    top: 16,
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
  musicChip: {
    borderColor: 'rgba(0, 240, 255, 0.4)',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  musicChipText: {
    color: Colors.secondary,
  },
});

export default ProfileCard;

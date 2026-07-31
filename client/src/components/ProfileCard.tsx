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

  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

      {/* Overlay com degradê escuro */}
      <View style={styles.gradientOverlay} />

      {/* Badge de Compatibilidade Geek */}
      <View style={styles.compatibilityBadge}>
        <Text style={styles.compatibilityText}>⚡ {compatibility}% GEEK MATCH</Text>
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

        {profile.bio ? <Text style={styles.bio} numberOfLines={3}>{profile.bio}</Text> : null}

        {/* Badges de Interesses Geek */}
        {profile.interests && profile.interests.length > 0 && (
          <View style={styles.interestsContainer}>
            {profile.interests.slice(0, 4).map((interest, idx) => (
              <View key={idx} style={styles.chip}>
                <Text style={styles.chipText}>{interest}</Text>
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
  compatibilityBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  compatibilityText: {
    color: Colors.secondary,
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 22,
    backgroundColor: 'rgba(15, 14, 23, 0.88)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 42, 133, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    color: Colors.text,
    fontSize: 26,
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
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
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
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProfileCard;

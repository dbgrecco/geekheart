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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { getImageUrl } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  const imageUrl = getImageUrl(user?.image) || 'https://via.placeholder.com/200';

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
        </View>

        {/* Estatísticas do Jogador */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={24} color={Colors.secondary} />
            <Text style={styles.statValue}>Geek</Text>
            <Text style={styles.statLabel}>Level 99</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-done-circle" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Verificado</Text>
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
          <Text style={styles.sectionTitle}>Seus Interesses</Text>
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

        {/* Ações */}
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="create-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.editButtonText}>Editar Perfil & Foto</Text>
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
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
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

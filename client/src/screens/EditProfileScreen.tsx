import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { Colors, GEEK_INTERESTS, MUSIC_GENRES } from '../theme/colors';
import { apiFetch, getImageUrl, API_BASE_URL } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

const EditProfileScreen = ({ navigation }: any) => {
  const { user, token, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [selectedMusic, setSelectedMusic] = useState<string[]>(user?.musicGenres || []);
  const [isTravelMode, setIsTravelMode] = useState<boolean>(user?.isTravelMode || false);
  const [travelLocationName, setTravelLocationName] = useState<string>(user?.travelLocationName || '');
  const [locationName, setLocationName] = useState<string>(user?.locationName || 'São Paulo, Brasil');
  
  // Redes Sociais
  const [spotifyUrl, setSpotifyUrl] = useState<string>(user?.spotifyUrl || '');
  const [instagramHandle, setInstagramHandle] = useState<string>(user?.instagramHandle || '');
  const [twitterHandle, setTwitterHandle] = useState<string>(user?.twitterHandle || '');
  const [tiktokHandle, setTiktokHandle] = useState<string>(user?.tiktokHandle || '');
  const [facebookUrl, setFacebookUrl] = useState<string>(user?.facebookUrl || '');
  const [showSocials, setShowSocials] = useState<boolean>(user?.showSocials !== false);

  const [imageUri, setImageUri] = useState<string | null>(getImageUrl(user?.image));
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleMusic = (genre: string) => {
    if (selectedMusic.includes(genre)) {
      setSelectedMusic(selectedMusic.filter((m) => m !== genre));
    } else {
      setSelectedMusic([...selectedMusic, genre]);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'É necessário acesso à galeria para alterar sua foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const selectedUri = result.assets[0].uri;
      setImageUri(selectedUri);
      uploadImage(selectedUri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/me/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha no upload da imagem');
      }

      const updatedUserData = await response.json();
      await updateUser({ image: updatedUserData.image });
      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao enviar imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'O nome não pode ficar em branco.');
      return;
    }

    setLoading(true);
    try {
      const updatedData = await apiFetch(
        '/api/me',
        {
          method: 'PUT',
          body: JSON.stringify({
            name,
            age: age ? Number(age) : null,
            bio,
            interests: selectedInterests,
            musicGenres: selectedMusic,
            isTravelMode,
            travelLocationName,
            locationName,
            spotifyUrl,
            instagramHandle,
            twitterHandle,
            tiktokHandle,
            facebookUrl,
            showSocials,
          }),
        },
        token
      );

      await updateUser(updatedData);
      Alert.alert('Sucesso', 'Seu perfil foi atualizado com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Erro ao Salvar', err.message || 'Não foi possível atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Upload Avatar */}
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage} disabled={uploadingImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={40} color={Colors.textMuted} />
            </View>
          )}
          {uploadingImage && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator color={Colors.primary} size="large" />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>Toque para alterar a foto</Text>

        {/* Inputs Básicos */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nome / Apelido</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor={Colors.textMuted} />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Idade</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Sua idade"
            placeholderTextColor={Colors.textMuted}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Sua Cidade Atual</Text>
          <TextInput
            style={styles.input}
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Ex: São Paulo, Brasil"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Modo Viagem / Geolocalização Global */}
        <View style={styles.travelSection}>
          <View style={styles.travelHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="airplane" size={22} color={Colors.secondary} style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.travelTitle}>Modo Viagem (Passport)</Text>
                <Text style={styles.travelSubtitle}>Conecte-se com geeks de qualquer cidade do mundo</Text>
              </View>
            </View>
            <Switch
              value={isTravelMode}
              onValueChange={setIsTravelMode}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={isTravelMode ? Colors.secondary : '#FFF'}
            />
          </View>

          {isTravelMode && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Cidade de Destino</Text>
              <TextInput
                style={styles.input}
                value={travelLocationName}
                onChangeText={setTravelLocationName}
                placeholder="Ex: Tóquio, Japão / Londres, UK"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          )}
        </View>

        {/* Redes Sociais & Mídia */}
        <View style={styles.socialsSection}>
          <View style={styles.socialsHeaderRow}>
            <Text style={styles.sectionTitle}>Redes Sociais & Mídia (Opcional)</Text>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Exibir no Perfil</Text>
              <Switch
                value={showSocials}
                onValueChange={setShowSocials}
                trackColor={{ false: Colors.border, true: Colors.secondary }}
                thumbColor={showSocials ? Colors.primary : '#FFF'}
              />
            </View>
          </View>

          <View style={styles.socialInputContainer}>
            <Ionicons name="musical-note" size={20} color="#1DB954" style={styles.socialInputIcon} />
            <TextInput
              style={styles.socialInput}
              value={spotifyUrl}
              onChangeText={setSpotifyUrl}
              placeholder="Spotify (URL ou Username)"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.socialInputContainer}>
            <Ionicons name="logo-instagram" size={20} color="#E1306C" style={styles.socialInputIcon} />
            <TextInput
              style={styles.socialInput}
              value={instagramHandle}
              onChangeText={setInstagramHandle}
              placeholder="Instagram (@username)"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.socialInputContainer}>
            <Ionicons name="logo-twitter" size={20} color="#1DA1F2" style={styles.socialInputIcon} />
            <TextInput
              style={styles.socialInput}
              value={twitterHandle}
              onChangeText={setTwitterHandle}
              placeholder="Twitter / X (@username)"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.socialInputContainer}>
            <Ionicons name="musical-notes-outline" size={20} color="#00F0FF" style={styles.socialInputIcon} />
            <TextInput
              style={styles.socialInput}
              value={tiktokHandle}
              onChangeText={setTiktokHandle}
              placeholder="TikTok (@username)"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.socialInputContainer}>
            <Ionicons name="logo-facebook" size={20} color="#1877F2" style={styles.socialInputIcon} />
            <TextInput
              style={styles.socialInput}
              value={facebookUrl}
              onChangeText={setFacebookUrl}
              placeholder="Facebook (Link ou Username)"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Biografia</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Conte mais sobre você, seus animes e jogos preferidos..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Interesses Geek */}
        <Text style={styles.sectionTitle}>Interesses Geek</Text>
        <View style={styles.interestsGrid}>
          {GEEK_INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[styles.interestChip, isSelected && styles.interestChipSelected]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[styles.interestChipText, isSelected && styles.interestChipTextSelected]}>{interest}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Modo Música & Trilhas Geek */}
        <Text style={styles.sectionTitle}>Gêneros Musicais, Metal & Trilhas Geek</Text>
        <View style={styles.interestsGrid}>
          {MUSIC_GENRES.map((genre) => {
            const isSelected = selectedMusic.includes(genre);
            return (
              <TouchableOpacity
                key={genre}
                style={[styles.interestChip, isSelected && styles.musicChipSelected]}
                onPress={() => toggleMusic(genre)}
              >
                <Text style={[styles.interestChipText, isSelected && styles.musicChipTextSelected]}>{genre}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar Alterações</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.background,
    flexGrow: 1,
  },
  imagePickerButton: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  changePhotoText: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
  },
  travelSection: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.secondary,
    marginBottom: 20,
  },
  travelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  travelTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  travelSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  socialsSection: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  socialsHeaderRow: {
    flexDirection: 'column',
    marginBottom: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  toggleLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  socialInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 10,
  },
  socialInputIcon: {
    marginRight: 10,
  },
  socialInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  interestChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  interestChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  musicChipSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  interestChipText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  interestChipTextSelected: {
    color: '#FFF',
  },
  musicChipTextSelected: {
    color: '#0F0E17',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;

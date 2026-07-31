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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { Colors, GEEK_INTERESTS } from '../theme/colors';
import { apiFetch, getImageUrl, API_BASE_URL } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

const EditProfileScreen = ({ navigation }: any) => {
  const { user, token, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
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

        {/* Inputs */}
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
    marginBottom: 24,
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
  textArea: {
    height: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 10,
    marginBottom: 12,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
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
  interestChipText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  interestChipTextSelected: {
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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

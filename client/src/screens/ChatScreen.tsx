import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { Message, User } from '../types';
import { Colors } from '../theme/colors';
import { apiFetch, getImageUrl, WS_BASE_URL, API_BASE_URL } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

const ICEBREAKERS = [
  '🎮 Qual seu jogo favorito de todos os tempos?',
  '🦸‍♂️ Marvel ou DC?',
  '🍥 Qual o melhor anime que você já assistiu?',
  '⚔️ Se você estivesse num RPG, qual seria sua classe?',
  '🌌 Preferiria viver no universo de Star Wars ou Harry Potter?',
  '👾 Qual seu console/plataforma principal?',
];

const ChatScreen = ({ route, navigation }: any) => {
  const { matchId, partner }: { matchId: string; partner: User } = route.params;
  const { user: currentUser, token } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [partnerOnline, setPartnerOnline] = useState(partner?.isOnline || false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);

  const handleBlockUser = async () => {
    Alert.alert(
      'Bloquear Usuário',
      `Tem certeza que deseja bloquear ${partner?.name}? Vocês não verão mais os perfis um do outro.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Bloquear',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch('/api/blocks', { method: 'POST', body: JSON.stringify({ blockedId: partner.id }) }, token);
              Alert.alert('Usuário Bloqueado', 'O usuário foi bloqueado com sucesso.');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Falha ao bloquear usuário');
            }
          },
        },
      ]
    );
  };

  const handleReportUser = () => {
    Alert.alert(
      'Denunciar Usuário',
      'Selecione o motivo da denúncia:',
      [
        { text: 'Conteúdo Impróprio', onPress: () => sendReport('Conteúdo Impróprio') },
        { text: 'Perfil Falso / Spam', onPress: () => sendReport('Perfil Falso / Spam') },
        { text: 'Comportamento Tóxico', onPress: () => sendReport('Comportamento Tóxico') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const sendReport = async (reason: string) => {
    try {
      await apiFetch('/api/reports', { method: 'POST', body: JSON.stringify({ reportedId: partner.id, reason }) }, token);
      Alert.alert('Denúncia Enviada', 'Obrigado por ajudar a manter o HeartGeek um lugar seguro!');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao enviar denúncia');
    }
  };

  // Define o header customizado
  useEffect(() => {
    const avatarUrl = getImageUrl(partner?.image) || 'https://via.placeholder.com/150';
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>{partner?.name}</Text>
            <Text style={styles.headerStatus}>
              {isPartnerTyping ? 'digitando...' : partnerOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', marginRight: 10 }}>
          <TouchableOpacity style={{ padding: 6 }} onPress={handleReportUser}>
            <Ionicons name="flag-outline" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 6, marginLeft: 8 }} onPress={handleBlockUser}>
            <Ionicons name="ban-outline" size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      ),
      headerStyle: { backgroundColor: Colors.background, elevation: 0, shadowOpacity: 0 },
      headerTintColor: Colors.text,
    });
  }, [navigation, partner, partnerOnline, isPartnerTyping]);

  // Carrega histórico de mensagens da API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await apiFetch(`/api/matches/${matchId}/messages`, {}, token);
        setMessages(data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && matchId) {
      fetchMessages();
    }
  }, [token, matchId]);

  // Conecta ao WebSocket server
  useEffect(() => {
    if (!token) return;

    const wsUrl = `${WS_BASE_URL}?token=${token}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected in ChatScreen');
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        if (data.type === 'TYPING' && data.matchId === matchId) {
          setIsPartnerTyping(data.isTyping);
          return;
        }

        if (data.type === 'PRESENCE_CHANGE' && data.userId === partner?.id) {
          setPartnerOnline(data.isOnline);
          return;
        }

        if (data.type === 'CHAT_MESSAGE' || data.text || data.imageUrl) {
          const newMsg: Message = {
            id: data.id || String(Date.now()),
            text: data.text || '',
            imageUrl: data.imageUrl || null,
            createdAt: data.createdAt || new Date().toISOString(),
            senderId: data.senderId || data.sender?.id,
            matchId: data.matchId || matchId,
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    return () => {
      ws.current?.close();
    };
  }, [token, matchId, partner?.id]);

  const handleInputChange = (text: string) => {
    setInputText(text);

    // Envia sinal de digitação via WS
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'TYPING',
          matchId,
          isTyping: text.length > 0,
        })
      );
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: 'TYPING',
            matchId,
            isTyping: false,
          })
        );
      }
    }, 2000);
  };

  const sendMessage = (textToSend?: string, imageUrlToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText.trim();
    if (!text && !imageUrlToSend) return;

    const payload = {
      type: 'CHAT_MESSAGE',
      matchId,
      text,
      imageUrl: imageUrlToSend || null,
      senderId: currentUser?.id,
    };

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
      if (!textToSend && !imageUrlToSend) {
        setInputText('');
      }
    }
  };

  const handleSendRandomIcebreaker = () => {
    const randomQuestion = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
    sendMessage(randomQuestion);
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para enviar imagens.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setUploadingImage(true);
      try {
        const localUri = result.assets[0].uri;
        const filename = localUri.split('/').pop() || 'photo.jpg';
        const matchType = /\.(\w+)$/.exec(filename);
        const type = matchType ? `image/${matchType[1]}` : 'image/jpeg';

        const formData = new FormData();
        formData.append('image', { uri: localUri, name: filename, type } as any);

        const response = await fetch(`${API_BASE_URL}/api/me/photos`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (response.ok) {
          const photoData = await response.json();
          sendMessage('', photoData.url);
        }
      } catch (err) {
        console.error('Failed to upload chat image', err);
      } finally {
        setUploadingImage(false);
      }
    }
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Lista de Mensagens */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyChatContainer}>
              <Text style={styles.emptyChatTitle}>Você deu match com {partner?.name}! 🎉</Text>
              <Text style={styles.emptyChatSubtitle}>Quebre o gelo enviando uma pergunta:</Text>
              <View style={styles.icebreakersWrapper}>
                {ICEBREAKERS.map((icebreaker, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.icebreakerChip}
                    onPress={() => sendMessage(icebreaker)}
                  >
                    <Text style={styles.icebreakerText}>{icebreaker}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const isMine = item.senderId === currentUser?.id;
            const chatImageUrl = getImageUrl(item.imageUrl);
            return (
              <View style={[styles.messageBubbleRow, isMine ? styles.myBubbleRow : styles.theirBubbleRow]}>
                <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                  {chatImageUrl ? (
                    <Image source={{ uri: chatImageUrl }} style={styles.chatImageBubble} resizeMode="cover" />
                  ) : null}
                  {item.text ? (
                    <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
                      {item.text}
                    </Text>
                  ) : null}
                  <Text style={styles.timeText}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          }}
          contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 14 }}
        />

        {/* Indicador de Digitação */}
        {isPartnerTyping && (
          <View style={styles.typingIndicatorRow}>
            <Text style={styles.typingIndicatorText}>{partner?.name} está digitando...</Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.mediaButton} onPress={handlePickImage} disabled={uploadingImage}>
            {uploadingImage ? (
              <ActivityIndicator size="small" color={Colors.secondary} />
            ) : (
              <Ionicons name="image-outline" size={24} color={Colors.secondary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.mediaButton} onPress={handleSendRandomIcebreaker}>
            <Text style={{ fontSize: 18 }}>🎲</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={handleInputChange}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: Colors.success,
    fontSize: 11,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubbleRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  myBubbleRow: {
    justifyContent: 'flex-end',
  },
  theirBubbleRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  chatImageBubble: {
    width: 200,
    height: 180,
    borderRadius: 12,
    marginBottom: 6,
  },
  myMessageText: {
    color: '#FFF',
  },
  theirMessageText: {
    color: Colors.text,
  },
  timeText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  typingIndicatorRow: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  typingIndicatorText: {
    color: Colors.secondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  mediaButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surfaceLight,
    opacity: 0.5,
  },
  emptyChatContainer: {
    alignItems: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyChatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyChatSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  icebreakersWrapper: {
    gap: 10,
    width: '100%',
  },
  icebreakerChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icebreakerText: {
    color: Colors.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ChatScreen;

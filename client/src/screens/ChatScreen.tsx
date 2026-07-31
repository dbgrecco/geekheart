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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Message, User } from '../types';
import { Colors } from '../theme/colors';
import { apiFetch, getImageUrl, WS_BASE_URL } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

const ICEBREAKERS = [
  ' Qual seu jogo favorito de todos os tempos?',
  ' Marvel ou DC?',
  ' Qual o melhor anime da temporada?',
  ' Preferiria viver em um universo Cyberpunk ou Fantasia?',
];

const ChatScreen = ({ route, navigation }: any) => {
  const { matchId, partner }: { matchId: string; partner: User } = route.params;
  const { user: currentUser, token } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [partnerOnline, setPartnerOnline] = useState(partner?.isOnline || false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);

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

        if (data.type === 'CHAT_MESSAGE' || data.text) {
          const newMsg: Message = {
            id: data.id || String(Date.now()),
            text: data.text,
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

  const sendMessage = (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const payload = {
      type: 'CHAT_MESSAGE',
      matchId,
      text,
      senderId: currentUser?.id,
    };

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
      setInputText('');
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
              <Text style={styles.emptyChatSubtitle}>Quebre o gelo enviando um tópico geek:</Text>
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
            return (
              <View style={[styles.messageBubbleRow, isMine ? styles.myBubbleRow : styles.theirBubbleRow]}>
                <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                  <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
                    {item.text}
                  </Text>
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

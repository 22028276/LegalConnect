import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAppTheme } from '../../../theme/theme.provider';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import {
  sendMessageToChatbot,
  chatbotActions,
  selectChatbotMessages,
  selectChatbotLoading,
  selectChatbotSessionId,
} from '../../../stores/chatbot.slice';
import { ChatbotMessage } from '../../../types/chatbot';
import * as styles from './styles';
import Header from '../../../components/layout/header';
import dayjs from 'dayjs';
import { t } from '../../../i18n';

function MessageItemComponent({
  item,
  onSuggestionPress,
}: {
  item: ChatbotMessage;
  onSuggestionPress?: (suggestion: string) => void;
}) {
  const { themed, theme } = useAppTheme();

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return theme.colors.processStatus.approved;
    if (confidence >= 0.5) return theme.colors.processStatus.pending;
    return theme.colors.processStatus.rejected;
  };

  return (
    <View
      style={[
        themed(styles.messageContainer),
        item.isBot ? themed(styles.botMessage) : themed(styles.userMessage),
      ]}
    >
      <View
        style={[
          themed(styles.messageBubble),
          item.isBot ? themed(styles.botBubble) : themed(styles.userBubble),
        ]}
      >
        <Text
          style={[
            themed(styles.messageText),
            item.isBot
              ? themed(styles.botMessageText)
              : themed(styles.userMessageText),
          ]}
        >
          {item.content}
        </Text>

        {/* Confidence Badge */}
        {item.isBot && item.confidence !== undefined && (
          <View
            style={[
              themed(styles.confidenceBadge),
              { backgroundColor: getConfidenceColor(item.confidence) + '20' },
            ]}
          >
            <Text
              style={[
                themed(styles.confidenceText),
                { color: getConfidenceColor(item.confidence) } as any,
              ]}
            >
              {(item.confidence * 100).toFixed(0)}% {t('chatbot.confidence')}
            </Text>
          </View>
        )}

        {/* Links */}
        {item.isBot && item.links && item.links.length > 0 && (
          <View style={themed(styles.linksContainer)}>
            {item.links.map((link, index) => (
              <TouchableOpacity
                key={`${item.id}-link-${index}-${link}`}
                onPress={() => Linking.openURL(link)}
              >
                <Text style={themed(styles.linkText)} numberOfLines={1}>
                  🔗 {link}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Suggestions */}
        {item.isBot && item.suggestions && item.suggestions.length > 0 && (
          <View style={themed(styles.suggestionsContainer)}>
            {item.suggestions.slice(0, 3).map((suggestion, index) => (
              <TouchableOpacity
                key={`${item.id}-suggestion-${index}-${suggestion.substring(
                  0,
                  20,
                )}`}
                style={themed(styles.suggestionChip)}
                onPress={() => {
                  onSuggestionPress?.(suggestion);
                }}
              >
                <Text style={themed(styles.suggestionText)} numberOfLines={2}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text
          style={[
            themed(styles.messageTime),
            item.isBot
              ? themed(styles.botMessageTime)
              : themed(styles.userMessageTime),
          ]}
        >
          {dayjs(item.timestamp).format('HH:mm')}
        </Text>
      </View>
    </View>
  );
}

export default function ChatbotScreen() {
  const { theme, themed } = useAppTheme();
  const dispatch = useAppDispatch();

  const messages = useAppSelector(selectChatbotMessages);
  const isLoading = useAppSelector(selectChatbotLoading);
  const sessionId = useAppSelector(selectChatbotSessionId);

  const [inputText, setInputText] = useState('');

  useEffect(() => {
    // Initialize session
    dispatch(chatbotActions.initializeSession());
  }, [dispatch]);

  const handleSendMessageDirect = async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Add user message to chat
    dispatch(chatbotActions.addUserMessage(message.trim()));

    // Send to chatbot
    await dispatch(
      sendMessageToChatbot({
        question: message.trim(),
        sessionId: sessionId || undefined,
      }),
    );
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const message = inputText.trim();
    setInputText('');
    await handleSendMessageDirect(message);
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSendMessageDirect(suggestion);
  };

  const handleClearChat = () => {
    dispatch(chatbotActions.clearChatHistory());
    dispatch(chatbotActions.initializeSession());
  };

  const renderEmpty = () => (
    <View style={themed(styles.emptyContainer)}>
      <Ionicons
        name="chatbubbles-outline"
        size={moderateScale(80)}
        color={theme.colors.onSurfaceVariant}
      />
      <Text style={themed(styles.emptyText)}>{t('chatbot.emptyMessage')}</Text>
    </View>
  );

  const renderLoadingIndicator = () => {
    if (!isLoading) return null;

    return (
      <View style={themed(styles.loadingContainer)}>
        <View style={themed(styles.loadingDot)} />
        <View style={themed(styles.loadingDot)} />
        <View style={themed(styles.loadingDot)} />
      </View>
    );
  };

  return (
    <SafeAreaView style={themed(styles.container)} edges={['top', 'bottom']}>
      <View style={themed(styles.headerContainer)}>
        <Header title={t('chatbot.title')} showBackButton={true} />
        {messages.length > 0 && (
          <TouchableOpacity
            style={[
              themed(styles.clearButton),
              themed(styles.clearButtonAbsolute),
            ]}
            onPress={handleClearChat}
          >
            <Ionicons
              name="trash-outline"
              size={moderateScale(24)}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      {messages.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <MessageItemComponent
              item={item}
              onSuggestionPress={handleSuggestionPress}
            />
          )}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={themed(styles.messagesList)}
          style={themed(styles.chatContainer)}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderLoadingIndicator}
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={themed(styles.inputContainer)}>
          <View style={themed(styles.inputRow)}>
            <View style={themed(styles.textInputContainer)}>
              <TextInput
                style={themed(styles.textInput)}
                placeholder={t('chatbot.placeholder')}
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSendMessage}
                multiline
                editable={!isLoading}
              />
            </View>
            <TouchableOpacity
              style={[
                themed(styles.sendButton),
                (!inputText.trim() || isLoading) &&
                  themed(styles.sendButtonDisabled),
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator
                  color={theme.colors.onPrimary}
                  size="small"
                />
              ) : (
                <Ionicons
                  name="send"
                  size={moderateScale(20)}
                  color={
                    inputText.trim()
                      ? theme.colors.onPrimary
                      : theme.colors.onSurfaceVariant
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

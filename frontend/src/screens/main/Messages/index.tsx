import Ionicons from '@react-native-vector-icons/ionicons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale } from 'react-native-size-matters';
import { MainStackNames } from '../../../navigation/routes';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import { fetchConversations } from '../../../stores/message.slice';
import { useAppTheme } from '../../../theme/theme.provider';
import { Conversation } from '../../../types/message';
import { getConversationTimeStatus } from '../../../utils/conversationTime.ts';
import * as styles from './styles';
import Header from '../../../components/layout/header/index.tsx';
import { useTranslation } from 'react-i18next';
import { store } from '../../../redux/store.ts';
import {
  connectChatSocket,
  subscribeChatEvents,
} from '../../../services/message.ts';

function ChatConversation({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const { theme, themed } = useAppTheme();
  const { t } = useTranslation();

  // Get receiver information
  const userId = useAppSelector(state => state.user.user.id);
  const receiver = conversation.participants.find(
    p => p.user.id !== userId,
  )?.user;

  return (
    <TouchableOpacity style={themed(styles.card)} onPress={onPress}>
      <View style={themed(styles.avatarWrapper)}>
        {(receiver as any)?.user?.avatar_url ? (
          <Image
            source={{ uri: (receiver as any)?.user?.avatar_url }}
            style={themed(styles.avatar)}
          />
        ) : (
          <View style={themed(styles.avatarPlaceholder)}>
            <Ionicons
              name="person"
              size={scale(20)}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        )}
      </View>
      <View style={themed(styles.content)}>
        <View style={themed(styles.nameRow)}>
          <Text style={themed(styles.name)} numberOfLines={1}>
            {/* Sau nhớ đổi thành tên người nhận, đừng để username */}
            {receiver?.username || t('messages.anonymousLawyer')}
          </Text>
          <Text style={themed(styles.timeText)}>
            {getConversationTimeStatus(conversation.last_message_at)}
          </Text>
        </View>
        <View style={themed(styles.messageRow)}>
          <Text style={themed(styles.lastMessage)} numberOfLines={1}>
            {conversation?.last_message?.content ||
              t('messages.noMessageContent')}
          </Text>
          {/* <Text style={themed(styles.ticks)}>✓✓</Text> */}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const { theme, themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<any>>();
  const { t } = useTranslation();

  const conversations = useAppSelector(
    (state: any) => state?.message?.conversation,
  );
  const loadingConversations = useAppSelector(
    (state: any) => state?.message?.loadingConversations,
  );
  const userId = useAppSelector((state: any) => state.user.user.id);
  console.log('userId: ', userId);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    const token =
      store.getState()?.user?.token?.replace(/^Bearer\s+/i, '') || '';
    if (token) {
      connectChatSocket(token);
    }
    const unsubscribe = subscribeChatEvents(evt => {
      if (evt.type === 'message') {
        dispatch(fetchConversations());
      }
    });
    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  // const renderItem = ({ item }: { item: ChatItem }) => (
  //   <TouchableOpacity
  //     style={themed(styles.card)}
  //     onPress={() =>
  //       navigation.navigate(MainStackNames.ChatDetail, {
  //         chatId: item.id,
  //         name: item.name,
  //         avatar: item.avatar,
  //       })
  //     }
  //   >
  //     <View style={themed(styles.avatarWrapper)}>
  //       <Image source={{ uri: item.avatar }} style={themed(styles.avatar)} />
  //       {item.online ? <View style={themed(styles.onlineDot)} /> : null}
  //     </View>
  //     <View style={themed(styles.content)}>
  //       <View style={themed(styles.nameRow)}>
  //         <Text style={themed(styles.name)} numberOfLines={1}>
  //           {item.name}
  //         </Text>
  //         <Text style={themed(styles.timeText)}>{item.time}</Text>
  //       </View>
  //       <View style={themed(styles.messageRow)}>
  //         <Text style={themed(styles.lastMessage)} numberOfLines={1}>
  //           {item.lastMessage}
  //         </Text>
  //         <Text style={themed(styles.ticks)}>✓✓</Text>
  //       </View>
  //     </View>
  //   </TouchableOpacity>
  // );
  const handleConversationPress = (
    conversation: Conversation,
    userid: string,
  ) => {
    const receiver = conversations
      .find((c: any) => c.id === conversation.id)
      ?.participants.find((p: any) => p.user.id !== userid);

    navigation.navigate(MainStackNames.ChatDetail, {
      chatId: conversation.id,
      name: receiver?.user.username || t('messages.anonymousLawyer'),
      avatar: '', // Thêm avatar nếu có
    });
  };

  if (loadingConversations) {
    return (
      <SafeAreaView style={themed(styles.loadingContainer)}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themed(styles.container)}>
      <Header title={t('messages.title')} showBackButton={false} />
      <FlatList
        data={conversations}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <ChatConversation
            conversation={item}
            onPress={() => handleConversationPress(item, userId)}
          />
        )}
        contentContainerStyle={themed(styles.listContent)}
      />
    </SafeAreaView>
  );
}

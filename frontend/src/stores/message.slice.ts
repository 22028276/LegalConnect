import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getAllConversations,
  getMessagesByConversationId,
  postMessageToConversation,
  postNewConversation,
} from '../services/message';
import { MessageState } from '../types/message';

const initialState: MessageState = {
  loadingConversations: false,
  loadingMessages: false,
  error: null,
  conversation: [],
  messages: [],
};

export const fetchConversations = createAsyncThunk(
  'message/fetchConversations',
  async (_, thunkApi) => {
    try {
      const response = await getAllConversations();
      return response;
    } catch (error) {
      return thunkApi.rejectWithValue(
        'Đã có lỗi xảy ra khi tải cuộc trò chuyện. Vui lòng thử lại sau.',
      );
    }
  },
);

export const createNewConversation = createAsyncThunk(
  'message/createNewConversation',
  async ({ receiverId }: { receiverId: string }, thunkApi) => {
    try {
      const response = await postNewConversation(receiverId);
      return response;
    } catch (error) {
      return thunkApi.rejectWithValue(
        'Đã có lỗi xảy ra khi tạo cuộc trò chuyện. Vui lòng thử lại sau.',
      );
    }
  },
);

export const fetchMessagesByConversationId = createAsyncThunk(
  'message/fetchMessagesByConversationId',
  async ({ conversationId }: { conversationId: string }, thunkApi) => {
    try {
      const response = await getMessagesByConversationId(conversationId);
      console.log('response: ', response);
      return response;
    } catch (error) {
      return thunkApi.rejectWithValue(
        'Đã có lỗi xảy ra khi tải tin nhắn. Vui lòng thử lại sau.',
      );
    }
  },
);

export const sendMessageAction = createAsyncThunk(
  'message/sendMessage',
  async (
    { conversationId, content }: { conversationId: string; content: string },
    thunkApi,
  ) => {
    try {
      const response = await postMessageToConversation(conversationId, content);
      return response;
    } catch (error) {
      return thunkApi.rejectWithValue(
        'Đã có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.',
      );
    }
  },
);

export const messageSlice = createSlice({
  initialState,
  name: 'message',
  reducers: {
    addIncomingMessage: (state, action) => {
      // Thêm tin nhắn từ WebSocket
      const newMessage = action.payload;
      // Check duplicate by ID or by content + timestamp (for optimistic updates)
      const isDuplicate = state.messages.some(
        m =>
          m.id === newMessage.id ||
          (m.content === newMessage.content &&
            Math.abs(
              new Date(m.created_at).getTime() -
                new Date(newMessage.created_at).getTime(),
            ) < 5000), // within 5 seconds
      );
      if (newMessage && !isDuplicate) {
        state.messages.push(newMessage);
      }
    },
    clearMessages: state => {
      state.messages = [];
    },
    updateConversationWithNewMessage: (state, action) => {
      // Cập nhật conversation list khi có tin nhắn mới từ WebSocket
      const newMessage = action.payload;
      const conversationId = newMessage.conversation_id;

      // Tìm conversation trong danh sách
      const conversationIndex = state.conversation.findIndex(
        c => c.id === conversationId,
      );

      if (conversationIndex !== -1) {
        // Cập nhật last_message và last_message_at
        const updatedConversation = {
          ...state.conversation[conversationIndex],
          last_message: newMessage,
          last_message_at: newMessage.created_at,
          updated_at: newMessage.created_at,
        };

        // Xóa conversation cũ và thêm vào đầu danh sách (most recent first)
        state.conversation.splice(conversationIndex, 1);
        state.conversation.unshift(updatedConversation);
      } else {
        // Nếu conversation chưa có trong list (có thể là conversation mới),
        // tạo một conversation tạm thời với thông tin từ message
        // Note: Điều này chỉ tạo một conversation cơ bản,
        // có thể cần fetchConversations để lấy đầy đủ thông tin participants
        const tempConversation: any = {
          id: conversationId,
          created_at: newMessage.created_at,
          updated_at: newMessage.created_at,
          last_message_at: newMessage.created_at,
          last_message: newMessage,
          participants: [], // Sẽ được cập nhật khi fetch lại
        };
        state.conversation.unshift(tempConversation);
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchConversations.pending, state => {
        // state.loadingConversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversation = action.payload;
        state.loadingConversations = false;
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loadingConversations = false;
        state.error = action.payload as string;
      })
      .addCase(createNewConversation.pending, state => {
        state.loadingConversations = true;
        state.error = null;
      })
      .addCase(createNewConversation.fulfilled, (state, action) => {
        state.conversation.push(action.payload);
        state.loadingConversations = false;
        state.error = null;
      })
      .addCase(createNewConversation.rejected, (state, action) => {
        state.loadingConversations = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMessagesByConversationId.pending, state => {
        console.log('Fetching messages - pending');
        // Không xóa messages cũ để tránh hiện loading khi refetch
        // Chỉ set loading = true khi chưa có messages
        if (state.messages.length === 0) {
          state.loadingMessages = true;
        }
        state.error = null;
      })
      .addCase(fetchMessagesByConversationId.fulfilled, (state, action) => {
        console.log('Fetching messages - fulfilled, payload:', action.payload);
        console.log('Number of messages:', action.payload?.length);
        state.messages = action.payload;
        state.loadingMessages = false;
        state.error = null;
      })
      .addCase(fetchMessagesByConversationId.rejected, (state, action) => {
        console.log('Fetching messages - rejected:', action.payload);
        state.loadingMessages = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessageAction.pending, _state => {
        // Có thể thêm loading state cho nút send nếu cần
      })
      .addCase(sendMessageAction.fulfilled, (state, action) => {
        // Thêm tin nhắn mới vào cuối danh sách
        console.log('Message sent successfully:', action.payload);
        const newMessage = action.payload;
        // Check duplicate by ID or by content + timestamp
        const isDuplicate = state.messages.some(
          m =>
            m.id === newMessage.id ||
            (m.content === newMessage.content &&
              Math.abs(
                new Date(m.created_at).getTime() -
                  new Date(newMessage.created_at).getTime(),
              ) < 5000), // within 5 seconds
        );
        if (newMessage && !isDuplicate) {
          state.messages.push(newMessage);
        }
      })
      .addCase(sendMessageAction.rejected, (_state, _action) => {
        console.error('Failed to send message');
      });
  },
});

export const messageReducer = messageSlice.reducer;
export const messageActions = messageSlice.actions;

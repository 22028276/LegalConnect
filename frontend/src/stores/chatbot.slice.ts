import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatbotState, ChatbotMessage } from '../types/chatbot';
import { sendChatbotMessage } from '../services/chatbot';

const generateId = () => {
  // return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return '3fa85f64-5717-4562-b3fc-2c963f66afa6';
};

const initialState: ChatbotState = {
  messages: [],
  isLoading: false,
  error: null,
  sessionId: null,
};

export const sendMessageToChatbot = createAsyncThunk(
  'chatbot/sendMessage',
  async (
    { question, sessionId }: { question: string; sessionId?: string },
    thunkApi,
  ) => {
    try {
      const response = await sendChatbotMessage(question, sessionId);
      return response;
    } catch (error: any) {
      return thunkApi.rejectWithValue(
        error.message || 'Failed to send message to chatbot',
      );
    }
  },
);

export const chatbotSlice = createSlice({
  initialState,
  name: 'chatbot',
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      const userMessage: ChatbotMessage = {
        id: generateId(),
        content: action.payload,
        isBot: false,
        timestamp: new Date().toISOString(),
      };
      state.messages.push(userMessage);
    },
    clearChatHistory: state => {
      state.messages = [];
      state.sessionId = null;
    },
    initializeSession: state => {
      if (!state.sessionId) {
        state.sessionId = generateId();
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(sendMessageToChatbot.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessageToChatbot.fulfilled, (state, action) => {
        state.isLoading = false;
        const botMessage: ChatbotMessage = {
          id: generateId(),
          content: action.payload.answer,
          isBot: true,
          timestamp: action.payload.asked_at,
          confidence: action.payload.confidence,
          suggestions: action.payload.suggestions.map(s => s.question),
          links: action.payload.links,
        };
        state.messages.push(botMessage);
      })
      .addCase(sendMessageToChatbot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const chatbotReducer = chatbotSlice.reducer;
export const chatbotActions = chatbotSlice.actions;

export const selectChatbotMessages = (state: { chatbot: ChatbotState }) =>
  state.chatbot.messages;
export const selectChatbotLoading = (state: { chatbot: ChatbotState }) =>
  state.chatbot.isLoading;
export const selectChatbotError = (state: { chatbot: ChatbotState }) =>
  state.chatbot.error;
export const selectChatbotSessionId = (state: { chatbot: ChatbotState }) =>
  state.chatbot.sessionId;

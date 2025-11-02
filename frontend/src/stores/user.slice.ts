import {
  fetchUserInfo,
  signIn,
  signUp,
  updateLawyerInfo,
  updateUserInfo,
} from '../services/auth';
import { FormLogin, FormSignUp } from '../types/auth';
import { User } from '../types/user';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from '../types/user.types';
import { AxiosError } from 'axios';
const initialState: UserState = {
  user: {
    id: '',
    email: '',
    avatar: '',
    username: '',
    phone_number: '',
    address: '',
    role: '',
  },
  token: '',
  refreshToken: '',
  isLoggedIn: false,
  isLoading: false,
  error: null,
};

export const signInWithEmailPassword = createAsyncThunk(
  'user/signInWithEmailPassword',
  async (data: FormLogin, thunkApi) => {
    try {
      const response = await signIn(data);
      // Response shape example:
      // { access_token: string, refresh_token: string, token_type: 'bearer' }
      const accessToken: string = (response?.access_token || '') as string;
      const tokenType: string = (response?.token_type || 'Bearer') as string;
      const normalizedToken = accessToken ? `${tokenType} ${accessToken}` : '';
      const builtUser: User | undefined = {
        id: (response?.user_id as string) || '',
        email: (response?.user_email as string) || '',
        username: (response?.username as string) || '',
        phone_number: (response?.phone_number as string) || '',
        address: (response?.address as string) || '',
        avatar: (response?.avatar_url as string) || '',
        role: (response?.role as string) || '',
      };
      return {
        user: builtUser,
        token: normalizedToken,
        refreshToken: (response?.refresh_token as string) || '',
      };
    } catch (error: any) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(
          error.response?.data?.message ||
            error.response?.data?.detail ||
            error.response?.data?.error ||
            error.message ||
            'Login failed',
        );
      }
      return thunkApi.rejectWithValue(error?.message || 'Login failed');
    }
  },
);

export const signUpWithEmailPassword = createAsyncThunk(
  'user/signUpWithEmailPassword',
  async (data: FormSignUp, thunkApi) => {
    try {
      const response = await signUp(data);
      return {
        user: response.user as User,
        token: response.access_token as string,
      };
    } catch (error: any) {
      if (error instanceof AxiosError) {
        return thunkApi.rejectWithValue(error.response?.data.message);
      }
      return thunkApi.rejectWithValue(error.message || 'Sign up failed');
    }
  },
);

export const signOut = createAsyncThunk('user/signOut', async () => {
  try {
    await new Promise((resolve: any) => setTimeout(resolve, 1000)); // Simulate network delay
  } catch (error) {}
});

export const getUserInfo = createAsyncThunk(
  'user/getUserInfo',
  async (_, thunkApi) => {
    try {
      const response = await fetchUserInfo();
      // API might return data directly or wrapped in data.data
      const data = response.data?.data || response.data;
      console.log('getUserInfo response data:', data);
      // API returns: { id, username, email, phone_number, address, role, avatar_url }
      // Normalize avatar_url to avatar for state
      const normalizedUser: User = {
        id: data.id || data.user_id || '',
        username: data.username || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        address: data.address || '',
        role: data.role || '',
        avatar: data.avatar_url || data.avatar || '',
      };
      console.log('normalizedUser avatar:', normalizedUser.avatar);
      return normalizedUser;
    } catch (error: any) {
      return thunkApi.rejectWithValue(
        error.message || 'Fetch user info failed',
      );
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (data: any, thunkApi) => {
    try {
      const response = await updateUserInfo(data);
      // API returns: { id, username, email, phone_number, address, role, avatar_url }
      // Normalize avatar_url to avatar for state
      const normalizedUser: User = {
        id: response.id || '',
        username: response.username || '',
        email: response.email || '',
        phone_number: response.phone_number || '',
        address: response.address || '',
        role: response.role || '',
        avatar: response.avatar || '',
      };
      return normalizedUser;
    } catch (error: any) {
      return thunkApi.rejectWithValue(
        error.message || 'Update user info failed',
      );
    }
  },
);

export const updateLawyerProfile = createAsyncThunk(
  'user/updateLawyerProfile',
  async (data: any, thunkApi) => {
    try {
      const response = await updateLawyerInfo(data);
      return response;
    } catch (error: any) {
      return thunkApi.rejectWithValue(
        error.message || 'Update lawyer info failed',
      );
    }
  },
);

export const userSlice = createSlice({
  initialState,
  name: 'user',
  reducers: {
    isLogging: (state: UserState) => {
      state.isLoading = true;
    },
    isLoggedIn: (state: UserState, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    isLoggedOut: (state: UserState) => {
      state.isLoading = false;
      state.isLoggedIn = false;
      state.user = {
        id: '',
        email: '',
        avatar: '',
        username: '',
        phone_number: '',
        address: '',
        role: '',
      };
      state.error = null;
    },
    setUser: (state: UserState, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setNewToken: (state: UserState, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setRefreshToken: (state: UserState, action: PayloadAction<string>) => {
      state.refreshToken = action.payload;
    },
    clearError: (state: UserState) => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(signInWithEmailPassword.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithEmailPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || '';
        // Only overwrite user if provided in payload
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(signInWithEmailPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signUpWithEmailPassword.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpWithEmailPassword.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signUpWithEmailPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signOut.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, state => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.user = {
          id: '',
          email: '',
          avatar: '',
          username: '',
          phone_number: '',
          address: '',
          role: '',
        };
        state.token = '';
        state.refreshToken = '';
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getUserInfo.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('action.payload: ', action.payload);
        // Map avatar_url from API to avatar in User interface
        const payload = action.payload;
        state.user = {
          id: payload?.id || '',
          email: payload?.email || '',
          username: payload?.username || '',
          phone_number: payload?.phone_number || null,
          address: payload?.address || null,
          avatar: payload?.avatar || '',
          role: payload?.role || '',
        };
      })
      .addCase(getUserInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Map avatar_url from API to avatar in User interface
        const payload = action.payload?.user || action.payload;
        if (payload) {
          state.user = {
            id: payload?.id || state.user.id,
            email: payload?.email || state.user.email,
            username: payload?.username || state.user.username,
            phone_number: payload?.phone_number ?? state.user.phone_number,
            address: payload?.address ?? state.user.address,
            avatar: payload?.avatar_url || payload?.avatar || state.user.avatar,
            role: payload?.role || state.user.role,
          };
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const userActions = userSlice.actions;

export const selectUser = (state: { user: UserState }) => state?.user?.user;
export const selectIsLoggedIn = (state: { user: UserState }) =>
  state?.user?.isLoggedIn;
export const selectIsLoading = (state: { user: UserState }) =>
  state?.user?.isLoading;
export const selectError = (state: { user: UserState }) => state?.user?.error;
export const selectRole = (state: { user: UserState }) =>
  state?.user?.user?.role;
export const selectRefreshToken = (state: { user: UserState }) =>
  state?.user?.refreshToken;

const userReducer = userSlice.reducer;
export default userReducer;

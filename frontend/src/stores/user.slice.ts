import {
  fetchUserInfo,
  signIn,
  signUp,
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
  },
  permissions: [],
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
      return {
        user: (response?.user as User) || undefined,
        token: normalizedToken,
        refreshToken: (response?.refresh_token as string) || '',
        permissions: (response?.permissions as string[]) || [],
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
        permissions: response.permissions as string[],
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
      return response.data;
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
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(
        error.message || 'Update user info failed',
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
        name: '',
      };
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
        state.permissions = action.payload.permissions || [];
      })
      .addCase(signInWithEmailPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signUpWithEmailPassword.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpWithEmailPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.permissions = action.payload.permissions;
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
          name: '',
        };
        state.token = '';
        state.refreshToken = '';
        state.permissions = [];
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
        state.user = action.payload;
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
        state.user = action.payload.user;
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
export const selectPermissions = (state: { user: UserState }) =>
  state?.user?.permissions;
export const selectRefreshToken = (state: { user: UserState }) =>
  state?.user?.refreshToken;

const userReducer = userSlice.reducer;
export default userReducer;

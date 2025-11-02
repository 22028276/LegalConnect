import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { CaseState, Case } from '../types/case';
import {
  getPendingCase,
  getUserCase,
  getPendingCaseById,
  getUserCaseById,
  updateCaseFiles,
  updateCaseNote,
} from '../services/case';
import { AxiosError } from 'axios';
import { File } from '../components/common/filePicker';
const initialState: CaseState = {
  cases: [],
  pendingCase: [],
  isLoading: false,
  error: null,
  currentCase: null,
};

export const fetchUserCases = createAsyncThunk(
  'case/fetchUserCases',
  async (_, thunkApi) => {
    try {
      const response = await getUserCase();
      return response;
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const data: any = error.response?.data;
        const message =
          data?.message ||
          data?.detail ||
          data?.error ||
          error.message ||
          'Fetch cases failed';
        return thunkApi.rejectWithValue(message);
      }
      return thunkApi.rejectWithValue(error?.message || 'Fetch cases failed');
    }
  },
);

export const fetchPendingCase = createAsyncThunk(
  'case/fetchPendingCases',
  async (_, thunkApi) => {
    try {
      const response = await getPendingCase();
      return response;
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const data: any = error.response?.data;
        const message =
          data?.message ||
          data?.detail ||
          data?.error ||
          error.message ||
          'Fetch cases failed';
        return thunkApi.rejectWithValue(message);
      }
      return thunkApi.rejectWithValue(error?.message || 'Fetch cases failed');
    }
  },
);

export const fetchPendingCaseById = createAsyncThunk(
  'case/fetchPendingCaseById',
  async (id: string, thunkApi) => {
    try {
      const response = await getPendingCaseById(id);
      return response;
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const data: any = error.response?.data;
        const message =
          data?.message ||
          data?.detail ||
          data?.error ||
          error.message ||
          'Fetch case failed';
        return thunkApi.rejectWithValue(message);
      }
      return thunkApi.rejectWithValue(error?.message || 'Fetch case failed');
    }
  },
);

export const fetchUserCaseById = createAsyncThunk(
  'case/fetchUserCaseById',
  async (id: string, thunkApi) => {
    try {
      const response = await getUserCaseById(id);
      return response;
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const data: any = error.response?.data;
        const message =
          data?.message ||
          data?.detail ||
          data?.error ||
          error.message ||
          'Fetch case failed';
        return thunkApi.rejectWithValue(message);
      }
      return thunkApi.rejectWithValue(error?.message || 'Fetch case failed');
    }
  },
);

export const addCaseFiles = createAsyncThunk(
  'case/addCaseFiles',
  async ({ caseId, files }: { caseId: string; files: File }, thunkApi) => {
    try {
      const response = await updateCaseFiles(caseId, files);
      return response;
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const data: any = error.response?.data;
        const message =
          data?.message ||
          data?.detail ||
          data?.error ||
          error.message ||
          'Update case files failed';
        return thunkApi.rejectWithValue(message);
      }
      return thunkApi.rejectWithValue(
        error?.message || 'Update case files failed',
      );
    }
  },
);

export const addCaseNote = createAsyncThunk(
  'case/addCaseNote',
  async (
    {
      caseId,
      note,
      role,
    }: { caseId: string; note: string; role: 'client ' | 'lawyer' },
    thunkApi,
  ) => {
    try {
      const response = await updateCaseNote(caseId, note, role);
      return response;
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const data: any = error.response?.data;
        const message =
          data?.message ||
          data?.detail ||
          data?.error ||
          error.message ||
          'Update case note failed';
        return thunkApi.rejectWithValue(message);
      }
      return thunkApi.rejectWithValue(
        error?.message || 'Update case note failed',
      );
    }
  },
);

export const caseSlice = createSlice({
  name: 'case',
  initialState,
  reducers: {
    setCurrentCase: (state, action: { payload: Case | null }) => {
      state.currentCase = action.payload;
    },
    clearCases: state => {
      state.cases = [];
      state.currentCase = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserCases.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserCases.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.cases = action.payload;
        } else {
          state.cases = [action.payload];
        }
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchUserCases.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPendingCase.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingCase.fulfilled, (state, action) => {
        state.pendingCase = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchPendingCase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPendingCaseById.pending, state => {
        state.isLoading = true;
        state.error = null;
        state.currentCase = null;
      })
      .addCase(fetchPendingCaseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentCase = action.payload;
      })
      .addCase(fetchPendingCaseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentCase = null;
      })
      .addCase(fetchUserCaseById.pending, state => {
        state.isLoading = true;
        state.error = null;
        state.currentCase = null;
      })
      .addCase(fetchUserCaseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentCase = action.payload;
      })
      .addCase(fetchUserCaseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentCase = null;
      })
      .addCase(addCaseFiles.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCaseFiles.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addCaseFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addCaseNote.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCaseNote.fulfilled, state => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addCaseNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const caseReducer = caseSlice.reducer;
export const caseActions = caseSlice.actions;

// Selectors
export const selectCases = (state: { case: CaseState }) => state.case.cases;
export const selectIsLoading = (state: { case: CaseState }) =>
  state.case.isLoading;
export const selectError = (state: { case: CaseState }) => state.case.error;
export const selectCurrentCase = (state: { case: CaseState }) =>
  state.case.currentCase;
export const selectCaseById = (state: { case: CaseState }, id: string) =>
  state.case.cases.find(c => c.id === id);
export const selectPendingCases = (state: { case: CaseState }) =>
  state.case.pendingCase;

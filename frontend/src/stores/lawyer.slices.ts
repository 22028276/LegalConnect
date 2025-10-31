import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LawyerState } from '../types/lawyer';
import { getLawyerById, getPopularLawyers } from '../services/lawyer';

const InitialState: LawyerState = {
  lawyers: [],
  isLoading: false,
  error: null,
};

export const fetchPopularLawyers = createAsyncThunk(
  'lawyer/fetchPopularLawyers',
  async (_, thunkApi) => {
    try {
      const response = await getPopularLawyers();
      return response;
    } catch (error) {
      return thunkApi.rejectWithValue(
        'Đã có lỗi xảy ra khi tải danh sách các luật sư. Vui lòng thử lại sau.',
      );
    }
  },
);

export const fetchLawyerById = createAsyncThunk(
  'lawyer/fetchLawyerById',
  async (id: string, thunkApi) => {
    try {
      const response = await getLawyerById(id);
      return response;
    } catch (error) {
      return thunkApi.rejectWithValue(
        'Đã có lỗi xảy ra khi tải thông tin luật sư. Vui lòng thử lại sau.',
      );
    }
  },
);

export const lawyerSlice = createSlice({
  name: 'lawyer',
  initialState: InitialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPopularLawyers.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPopularLawyers.fulfilled, (state, action) => {
        state.lawyers = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchPopularLawyers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLawyerById.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLawyerById.fulfilled, (state, action) => {
        console.log('action.payload: ', action.payload);
        const existingIndex = state.lawyers.findIndex(
          lawyer => lawyer.user_id === action.payload.user_id,
        );
        console.log('existingIndex: ', existingIndex);
        console.log(
          'state.lawyers: ',
          state.lawyers.find(
            lawyer => lawyer.user_id === action.payload.user_id,
          ),
        );
        if (existingIndex !== -1) {
          state.lawyers[existingIndex] = {
            ...state.lawyers[existingIndex],
            ...action.payload,
          };
        } else {
          state.lawyers.push(action.payload);
        }
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchLawyerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectLawyers = (state: { lawyer: LawyerState }) =>
  state.lawyer.lawyers;
export const selectIsLoading = (state: { lawyer: LawyerState }) =>
  state.lawyer.isLoading;
export const selectError = (state: { lawyer: LawyerState }) =>
  state.lawyer.error;
export const lawyerReducer = lawyerSlice.reducer;
export const lawyerActions = lawyerSlice.actions;
export const selectLawyerById = (state: { lawyer: LawyerState }, id: string) =>
  state.lawyer.lawyers.find(lawyer => lawyer.user_id === id);

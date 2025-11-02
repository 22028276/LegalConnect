import axios from 'axios';
import { showError } from '../types/toast';
import { t } from '../i18n';

export const getPopularLawyers = async () => {
  try {
    const response = await axios.get('/lawyer/profile', {
      // params: { sort: 'average_rating', order: 'desc' },
    });
    return response.data;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      'Fetch lawyers failed';
    showError(t('toast.loadLawyersFailed'), message);
    throw new Error(message);
  }
};

export const getAllLawyers = async () => {
  try {
    const response = await axios.get('/lawyer/profile');
    return response.data;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      'Fetch lawyers failed';
    showError(t('toast.loadLawyersFailed'), message);
    throw new Error(message);
  }
};

export const getLawyerById = async (id: string) => {
  try {
    const response = await axios.get(`/lawyer/profile/${id}`);
    return response.data;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      'Fetch lawyer failed';
    showError(t('toast.loadLawyerFailed'), message);
    throw new Error(message);
  }
};

export const getLawyerByCategory = async (category: string) => {
  try {
    const response = await axios.get(`/lawyer/profile/category/${category}`);
    return response.data.data;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      'Fetch lawyers by category failed';
    showError(t('toast.loadLawyersFailed'), message);
    throw new Error(message);
  }
};

export const getLawyerByPage = async (page: number) => {
  try {
    const response = await axios.get(`/lawyer/profile/page/${page}`);
    return response.data.data;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      'Fetch lawyers by page failed';
    showError(t('toast.loadLawyersFailed'), message);
    throw new Error(message);
  }
};

export const getLawyerRatings = async (lawyerId: string) => {
  try {
    const response = await axios.get(`/booking/lawyers/${lawyerId}/ratings`);
    return response.data;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      'Fetch ratings failed';
    showError(t('toast.loadRatingsFailed'), message);
    throw new Error(message);
  }
};

export const getLawyerSchedule = async (lawyerId: string) => {
  try {
    const response = await axios.get(`/booking/lawyers/${lawyerId}/schedule`);
    return response.data;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      'Fetch ratings failed';
    showError(t('toast.loadRatingsFailed'), message);
    throw new Error(message);
  }
};

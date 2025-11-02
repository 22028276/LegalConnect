import axios from 'axios';
import { showError } from '../types/toast';
import { t } from '../i18n';
import { File } from '../components/common/filePicker';
export const getUserCase = async () => {
  try {
    const response = await axios.get('/booking/cases/me');
    const payload = response?.data ?? [];
    return payload;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      'Fetch cases failed';
    showError(t('toast.fetchCasesFailed'), message);
    throw new Error(message);
  }
};

export const getPendingCase = async () => {
  try {
    const response = await axios.get('/booking/requests/me');
    const payload = response?.data ?? [];
    return payload;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      'Fetch cases failed';
    showError(t('toast.fetchCasesFailed'), message);
    throw new Error(message);
  }
};

export const getPendingCaseById = async (id: string) => {
  try {
    const response = await axios.get(`/booking/requests/${id}`);
    return response.data;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      'Fetch case failed';
    showError(t('common.error'), message);
    throw new Error(message);
  }
};

export const getUserCaseById = async (id: string) => {
  try {
    const response = await axios.get(`/booking/cases/${id}`);
    return response.data;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      'Fetch case failed';
    showError(t('common.error'), message);
    throw new Error(message);
  }
};

export const updateCaseFiles = async (caseId: string, files: File) => {
  try {
    const formData = new FormData();

    formData.append('attachment', {
      uri: files.uri,
      type: files.type,
      name: files.name,
    } as any);

    const response = await axios.post(
      `/booking/cases/${caseId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      t('common.error');
    showError(t('common.error'), message);
    throw new Error(message);
  }
};

export const updateCaseNote = async (caseId: string, note: string) => {
  try {
    const response = await axios.patch(`/booking/cases/${caseId}/notes`, {
      client_note: note,
    });
    return response.data;
  } catch (error: any) {
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      t('common.error');
    showError(t('common.error'), message);
    throw new Error(message);
  }
};

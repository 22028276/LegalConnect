import axios from 'axios';
import { showError, showSuccess } from '../types/toast';
import { t } from '../i18n';
import { store } from '../redux/store';
import envConfig from '../config/env';
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

export const getCaseById = async (caseId: string): Promise<any> => {
  try {
    const response = await axios.get(`/booking/cases/${caseId}`, {
      baseURL: envConfig.baseUrl,
    });
    const payload = response?.data?.data ?? response?.data;
    return payload;
  } catch (error: any) {
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to get case';
    showError('Failed to get case', message);
    throw new Error(message);
  }
};

export const getPendingCase = async () => {
  try {
    // Get user role from store to determine correct endpoint
    const user = store?.getState()?.user?.user;
    const userRole = user?.role;

    // Use /booking/requests/incoming for lawyers, /booking/requests/me for clients
    const endpoint =
      userRole === 'lawyer'
        ? '/booking/requests/incoming'
        : '/booking/requests/me';

    const response = await axios.get(endpoint);
    const payload = response?.data ?? [];
    return Array.isArray(payload) ? payload : [];
  } catch (error: any) {
    // If this is an auth error (403/401), it might be because user doesn't have access
    // Return empty array instead of throwing to prevent logout
    if (error?.response?.status === 403 || error?.response?.status === 401) {
      console.warn(
        'Access denied to booking requests endpoint. This may be normal if user role changed.',
      );
      return [];
    }

    // For other errors, log and return empty array to prevent logout
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      error?.message ||
      'Fetch cases failed';
    console.error('Error fetching pending cases:', message);
    // Show error but don't throw to prevent logout
    showError(t('toast.fetchCasesFailed') || 'Failed to fetch cases', message);
    return [];
  }
};

export interface CaseNotePayload {
  role: 'client' | 'lawyer';
  note: string;
}

export const updateCaseNotes = async (
  caseId: string,
  data: CaseNotePayload,
): Promise<any> => {
  try {
    const response = await axios.patch(`/booking/cases/${caseId}/notes`, data, {
      baseURL: envConfig.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
    const payload = response?.data?.data ?? response?.data;
    showSuccess('Case notes updated successfully');
    return payload;
  } catch (error: any) {
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to update case notes';
    showError('Failed to update case notes', message);
    throw new Error(message);
  }
};

export const addCaseAttachment = async (
  caseId: string,
  attachment: {
    uri: string;
    type: string;
    name: string;
  },
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('attachment', {
      uri: attachment.uri,
      type: attachment.type,
      name: attachment.name,
    } as any);

    const response = await axios.post(
      `/booking/cases/${caseId}/attachments`,
      formData,
      {
        baseURL: envConfig.baseUrl,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    const payload = response?.data?.data ?? response?.data;
    showSuccess('Attachment added successfully');
    return payload;
  } catch (error: any) {
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to add attachment';
    showError('Failed to add attachment', message);
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

export const updateCaseNote = async (
  caseId: string,
  note: string,
  role: 'client' | 'lawyer',
) => {
  try {
    const roleTrimmed = role.trim();
    const response = await axios.patch(`/booking/cases/${caseId}/notes`, {
      [roleTrimmed === 'client' ? 'client_note' : 'lawyer_note']: note,
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

export interface UpdateCaseStatePayload {
  title: string;
  description: string;
  state: 'COMPLETED' | 'CANCELLED';
}

export const updateCaseState = async (
  caseId: string,
  data: UpdateCaseStatePayload,
): Promise<any> => {
  try {
    const response = await axios.patch(`/booking/cases/${caseId}`, data, {
      baseURL: envConfig.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
    const payload = response?.data?.data ?? response?.data;
    const stateMessage =
      data.state === 'COMPLETED'
        ? t('toast.caseCompleted') || 'Case marked as completed'
        : t('toast.caseCancelled') || 'Case marked as cancelled';
    showSuccess(stateMessage);
    return payload;
  } catch (error: any) {
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to update case state';
    showError('Failed to update case state', message);
    throw new Error(message);
  }
};

export interface RateCasePayload {
  stars: number;
  detailed_review?: string;
}

export const rateCase = async (
  caseId: string,
  data: RateCasePayload,
): Promise<any> => {
  try {
    const response = await axios.post(
      `/booking/cases/${caseId}/rating`,
      {
        stars: data.stars,
        detailed_review: data.detailed_review,
      },
      {
        baseURL: envConfig.baseUrl,
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const payload = response?.data?.data ?? response?.data;
    const successMessage =
      t('rating.success') || 'Rating submitted successfully';
    showSuccess(successMessage);
    return payload;
  } catch (error: any) {
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to submit rating';
    showError('Failed to submit rating', message);
    throw new Error(message);
  }
};

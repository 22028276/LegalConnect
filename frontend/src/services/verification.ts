import axios from 'axios';
import {
  VerificationRequest,
  VerificationRequestWithUser,
} from '../types/verification';
import { showError, showSuccess } from '../types/toast';
import { t } from '../i18n';

export interface LawyerVerificationData {
  identity_card_front: {
    uri: string;
    type?: string;
    name: string;
    size?: number;
  };
  identity_card_back: {
    uri: string;
    type?: string;
    name: string;
    size?: number;
  };
  portrait: {
    uri: string;
    type?: string;
    name: string;
    size?: number;
  };
  law_certificate: {
    uri: string;
    type?: string;
    name: string;
    size?: number;
  };
  bachelor_degree: {
    uri: string;
    type?: string;
    name: string;
    size?: number;
  };
  years_of_experience: number;
  current_job_position?: string;
}

/**
 * Create lawyer verification request
 */
export const createLawyerVerificationRequest = async (
  data: LawyerVerificationData,
): Promise<VerificationRequest> => {
  try {
    const formData = new FormData();

    // Add file fields
    formData.append('identity_card_front', {
      uri: data.identity_card_front.uri,
      type: data.identity_card_front.type,
      name: data.identity_card_front.name,
    } as any);

    formData.append('identity_card_back', {
      uri: data.identity_card_back.uri,
      type: data.identity_card_back.type,
      name: data.identity_card_back.name,
    } as any);

    formData.append('portrait', {
      uri: data.portrait.uri,
      type: data.portrait.type,
      name: data.portrait.name,
    } as any);

    formData.append('law_certificate', {
      uri: data.law_certificate.uri,
      type: data.law_certificate.type,
      name: data.law_certificate.name,
    } as any);

    formData.append('bachelor_degree', {
      uri: data.bachelor_degree.uri,
      type: data.bachelor_degree.type,
      name: data.bachelor_degree.name,
    } as any);

    // Add text fields
    formData.append('years_of_experience', data.years_of_experience.toString());

    if (data.current_job_position) {
      formData.append('current_job_position', data.current_job_position);
    }

    const response = await axios.post(
      '/lawyer/verification-requests',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    showSuccess(t('toast.verificationRequestCreated'));
    return response.data;
  } catch (error: any) {
    console.error('Error creating verification request:', error);
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to create verification request';
    showError(t('toast.verificationRequestFailed'), message);
    throw error;
  }
};

/**
 * Get all lawyer verification requests (admin only)
 */
export const getAllVerificationRequests = async (): Promise<
  VerificationRequest[]
> => {
  try {
    const response = await axios.get('/lawyer/verification-requests');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching verification requests:', error);
    throw error;
  }
};

/**
 * Get my verification requests (lawyer)
 */
export const getMyVerificationRequests = async (): Promise<
  VerificationRequest[]
> => {
  try {
    const response = await axios.get('/lawyer/verification-requests/me');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching my verification requests:', error);
    throw error;
  }
};

/**
 * Get verification request by ID
 */
export const getVerificationRequestById = async (
  requestId: string,
): Promise<VerificationRequestWithUser> => {
  try {
    const response = await axios.get(
      `/lawyer/verification-requests/${requestId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching verification request:', error);
    throw error;
  }
};

/**
 * Approve verification request (admin only)
 */
export const approveVerificationRequest = async (
  requestId: string,
): Promise<void> => {
  try {
    await axios.patch(`/lawyer/verification-requests/${requestId}/approve`);
  } catch (error: any) {
    console.error('Error approving verification request:', error);
    throw error;
  }
};

/**
 * Reject verification request (admin only)
 */
export const rejectVerificationRequest = async (
  requestId: string,
  rejectionReason: string,
): Promise<void> => {
  try {
    await axios.patch(`/lawyer/verification-requests/${requestId}/reject`, {
      rejection_reason: rejectionReason,
    });
  } catch (error: any) {
    console.error('Error rejecting verification request:', error);
    throw error;
  }
};

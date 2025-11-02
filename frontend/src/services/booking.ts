import axios from 'axios';
import { showError, showSuccess } from '../types/toast';
import { t } from '../i18n';
import envConfig from '../config/env';

export interface BookingRequestPayload {
  lawyer_id: string;
  title: string;
  short_description: string;
  desired_start_time: string; // ISO 8601 format
  desired_end_time: string; // ISO 8601 format
  attachment?: {
    uri: string;
    type: string;
    name: string;
  };
}

export interface ScheduleSlot {
  id: string;
  lawyer_id: string;
  start_time: string;
  end_time: string;
  is_booked?: boolean;
  create_at: string;
  updated_at: string;
}

export interface ScheduleSlotCreatePayload {
  start_time: string; // ISO 8601 format
  end_time: string; // ISO 8601 format
}

export const createBookingRequest = async (
  data: BookingRequestPayload,
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('lawyer_id', data.lawyer_id);
    formData.append('title', data.title);
    formData.append('short_description', data.short_description);
    formData.append('desired_start_time', data.desired_start_time);
    formData.append('desired_end_time', data.desired_end_time);

    if (data.attachment) {
      formData.append('attachment', {
        uri: data.attachment.uri,
        type: data.attachment.type,
        name: data.attachment.name,
      } as any);
    }

    const response = await axios.post('/booking/requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to create booking request';
    throw new Error(message);
  }
};

export const getPersonalBookingRequest = async (): Promise<any> => {
  try {
    const response = await axios.get('/booking/requests/me');
    return response.data;
  } catch (error: any) {
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to get booking requests';
    showError('Failed to get booking requests', message);
    throw new Error(message);
  }
};

export const getBookingRequest = async (bookingId: string): Promise<any> => {
  try {
    const response = await axios.get(`/booking/requests/${bookingId}`, {
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
      'Failed to get booking request';
    showError('Failed to get booking request', message);
    throw new Error(message);
  }
};

export interface BookingDecisionPayload {
  accept: boolean;
}

export const decideBookingRequest = async (
  bookingId: string,
  data: BookingDecisionPayload,
): Promise<any> => {
  try {
    // Send request body as { "accept": true } or { "accept": false }
    const response = await axios.post(
      `/booking/requests/${bookingId}/decision`,
      { accept: data.accept },
      {
        baseURL: envConfig.baseUrl,
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const payload = response?.data?.data ?? response?.data;
    showSuccess(
      data.accept
        ? 'Booking request accepted successfully'
        : 'Booking request declined successfully',
    );
    return payload;
  } catch (error: any) {
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to decide booking request';
    showError('Failed to decide booking request', message);
    throw new Error(message);
  }
};

// Schedule Management Functions
export const getMySchedule = async (): Promise<ScheduleSlot[]> => {
  try {
    const response = await axios.get('/booking/schedule/me', {
      baseURL: envConfig.baseUrl,
    });
    const payload = response?.data?.data ?? response?.data;
    return Array.isArray(payload) ? payload : [];
  } catch (error: any) {
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to fetch schedule';
    showError('Failed to fetch schedule', message);
    throw new Error(message);
  }
};

export const createScheduleSlot = async (
  data: ScheduleSlotCreatePayload,
): Promise<ScheduleSlot> => {
  try {
    const body = {
      start_time: data.start_time,
      end_time: data.end_time,
    };
    const response = await axios.post('/booking/schedule', body, {
      baseURL: envConfig.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
    const payload = response?.data?.data ?? response?.data;
    showSuccess('Schedule slot created successfully');
    return payload;
  } catch (error: any) {
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to create schedule slot';
    showError('Failed to create schedule slot', message);
    throw new Error(message);
  }
};

export const updateScheduleSlot = async (
  slotId: string,
  data: ScheduleSlotCreatePayload,
): Promise<ScheduleSlot> => {
  try {
    const body = {
      start_time: data.start_time,
      end_time: data.end_time,
    };
    const response = await axios.patch(`/booking/schedule/${slotId}`, body, {
      baseURL: envConfig.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
    const payload = response?.data?.data ?? response?.data;
    showSuccess('Schedule slot updated successfully');
    return payload;
  } catch (error: any) {
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to update schedule slot';
    showError('Failed to update schedule slot', message);
    throw new Error(message);
  }
};

export const deleteScheduleSlot = async (slotId: string): Promise<void> => {
  try {
    await axios.delete(`/booking/schedule/${slotId}`, {
      baseURL: envConfig.baseUrl,
    });
    showSuccess('Schedule slot deleted successfully');
  } catch (error: any) {
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Failed to delete schedule slot';
    showError('Failed to delete schedule slot', message);
    throw new Error(message);
  }
};

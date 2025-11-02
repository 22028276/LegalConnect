import envConfig from '../config/env';
import { FormLogin, FormSignUp } from '../types/auth';
import axios from 'axios';
import { showError, showSuccess } from '../types/toast';
import { t } from '../i18n';

export const signIn = async (data: FormLogin) => {
  const formData = new FormData();
  formData.append('username', data.email);
  formData.append('password', data.password);
  try {
    const response = await axios.post('/auth/login', formData, {
      baseURL: envConfig.baseUrl,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const payload = response?.data?.data ?? response?.data;
    console.log('login response: ', payload);
    if (response.data?.status === 'error') {
      throw new Error(response.data?.message || 'Login failed');
    }
    showSuccess(t('toast.loginSuccessful'));
    return payload;
  } catch (err: any) {
    const errmsg = err?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      err?.message ||
      'Login failed';
    showError(t('toast.loginFailed'), message);
    throw new Error(message);
  }
};

export const signUp = async (data: FormSignUp) => {
  try {
    const body = {
      email: data.email,
      password: data.password,
      username: data.name,
    };
    const response = await axios.post('/users/register', body, {
      baseURL: envConfig.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
    const payload = response?.data?.data ?? response?.data;
    console.log('signup response: ', payload);
    if (payload?.status === 'error') {
      throw new Error(payload?.message || 'Sign up failed');
    }
    showSuccess(t('toast.signUpSuccessful'));
    return payload;
  } catch (err: any) {
    const errmsg = err?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      err?.message ||
      'Sign up failed';
    showError(t('toast.signUpFailed'), message);
    throw new Error(message);
  }
};

export const fetchUserInfo = async () => {
  try {
    const response = await axios.get('/users/me', {
      baseURL: envConfig.baseUrl,
    });
    return response;
  } catch (error: any) {
    console.log('error fetch user info: ', error);
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Fetch user info failed';
    showError(t('toast.fetchUserInfoFailed'), message);
    throw error;
  }
};
export const updateUserInfo = async (data: any) => {
  console.log(data);
  try {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('phone_number', data.phone_number);
    formData.append('address', data.address);
    formData.append('avatar', data.avatar);

    const response = await axios.put('/users/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      baseURL: envConfig.baseUrl,
    });

    showSuccess(t('toast.updateUserInfoSuccessful'));
    // API returns: { id, username, email, phone_number, address, role, avatar_url }
    const payload = response?.data?.data ?? response?.data;
    return payload;
  } catch (error: any) {
    console.log('error update user info: ', error);
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Update user info failed';
    showError(t('toast.updateUserInfoFailed'), message);
    throw error;
  }
};

export const updateLawyerInfo = async (data: any) => {
  console.log(data);
  // const data = new FormData();

  try {
    const response = await axios.patch('/lawyer/profile/me', data, {
      headers: { 'Content-Type': 'application/json' },
      baseURL: envConfig.baseUrl,
    });
    showSuccess(t('toast.updateLawyerInfoSuccessful'));
    return response.data;
  } catch (error: any) {
    console.log('error update lawyer info: ', error);
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Update lawyer info failed';
    showError(t('toast.updateLawyerInfoFailed'), message);
    throw error;
  }
};
export const forgotPassword = async (email: string) => {
  try {
    const response = await axios.post(
      '/users/forget-password',
      { email },
      {
        baseURL: envConfig.baseUrl,
        headers: { 'Content-Type': 'application/json' },
      },
    );
    showSuccess(
      t('toast.forgotPasswordSuccess'),
      t('toast.forgotPasswordSuccessMessage'),
    );
    return response.data;
  } catch (error: any) {
    console.log('error forgot password: ', error);
    const errmsg = error?.response?.data;
    const message =
      errmsg?.message ||
      errmsg?.detail ||
      errmsg?.error ||
      error?.message ||
      'Forgot password failed';
    showError(t('toast.forgotPasswordFailed'), message);
    throw error;
  }
};

export const resetPassword = async (
  otp: string,
  email: string,
  newPassword: string,
  confirmPassword: string,
) => {
  try {
    const response = await axios.post(
      `/users/reset-password`,
      {
        otp: otp,
        email: email,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
      {
        baseURL: envConfig.baseUrl,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    showSuccess(
      t('toast.resetPasswordSuccess'),
      t('toast.resetPasswordSuccessMessage'),
    );
    return response.data;
  } catch (error: any) {
    console.log('error reset password: ', error);
    const errmsg = error?.response?.data;

    // Handle validation errors
    let message = 'Reset password failed';
    if (errmsg?.detail) {
      if (Array.isArray(errmsg.detail)) {
        // FastAPI validation error format
        const firstError = errmsg.detail[0];
        message = firstError?.msg || message;
      } else if (typeof errmsg.detail === 'string') {
        message = errmsg.detail;
      }
    } else {
      message = errmsg?.message || errmsg?.error || error?.message || message;
    }

    showError(t('toast.resetPasswordFailed'), message);
    throw error;
  }
};

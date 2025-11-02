import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import envConfig from '../config/env';
import { store } from '../redux/store';
import { Alert } from 'react-native';
import { userActions } from '../stores/user.slice';
import { i18n } from '../i18n';

let isRefreshToken = false;
let requestsToRetry: any[] = [];

axios.defaults.timeout = 60000;
axios.defaults.baseURL = envConfig.baseUrl;

const setupAxiosInterceptors = () => {
  const onRequestSuccess = (config: InternalAxiosRequestConfig) => {
    const token = store?.getState()?.user?.token;

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    config.headers['User-Agent'] =
      'Mozilla/5.0 (Linux; Android 12; sdk_gphone64_arm64 Build/SE1A.220630.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36';
    // token is already normalized: `${token_type} ${access_token}`
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  };
  const onRequestError = (err: AxiosError) => {
    return Promise.reject(err);
  };
  const onResponseSuccess = (response: AxiosResponse<any>) =>
    Promise.resolve(response);
  const onResponseError = (err: any) => {
    const { response, config } = err;
    const status = response?.status;
    console.log('status: ', status);
    if (status === 403) {
      store.dispatch(userActions.setNewToken(''));
      store.dispatch(userActions.isLoggedOut());
      return Promise.reject(err);
    }

    if (status === 401) {
      const refreshToken = store?.getState()?.user?.refreshToken;
      console.log('refreshToken: ', refreshToken);
      if (!refreshToken) {
        return Promise.reject(err);
      }

      if (!isRefreshToken) {
        isRefreshToken = true;
        axios
          .post(
            '/auth/refresh',
            {},
            {
              baseURL: envConfig.baseUrl,
              headers: {
                'Content-Type': 'application/json',
                'User-Agent':
                  'Mozilla/5.0 (Linux; Android 12; sdk_gphone64_arm64 Build/SE1A.220630.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36',
                // Use refresh token as Bearer
                Authorization: `Bearer ${refreshToken}`,
              },
            },
          )
          .then((res: AxiosResponse) => {
            const raw = res?.data?.data ?? res?.data;
            console.log('resData refresh token: ', raw);

            const accessToken: string = raw?.access_token || '';
            const newRefreshToken: string = raw?.refresh_token || '';
            const tokenType: string = raw?.token_type || 'Bearer';

            if (accessToken) {
              const normalized = `${tokenType} ${accessToken}`;
              store.dispatch(userActions.setNewToken(normalized));
              if (newRefreshToken) {
                store.dispatch(userActions.setRefreshToken(newRefreshToken));
              }
              requestsToRetry.forEach(callback => {
                callback(normalized);
              });
            } else {
              store.dispatch(userActions.setNewToken(''));
              requestsToRetry.forEach(callback => {
                callback(null);
              });
              store.dispatch(userActions.isLoggedOut());
            }
          })
          .catch((error: AxiosError) => {
            console.log('error refresh token: ', error);
            store.dispatch(userActions.setNewToken(''));
            store.dispatch(userActions.setRefreshToken(''));
            requestsToRetry.forEach(callback => {
              callback(null);
            });
            store.dispatch(userActions.isLoggedOut());
            Alert.alert(
              i18n.t('common.sessionExpired'),
              i18n.t('common.sessionExpiredMessage'),
            );
            return Promise.reject(error);
          })
          .finally(() => {
            isRefreshToken = false;
            requestsToRetry = [];
          });
      }

      return new Promise((resolve, reject) => {
        requestsToRetry.push((tok: string) => {
          if (tok) {
            config.headers.Authorization = tok;
            resolve(axios(config));
          }
          reject(err);
        });
      });
    }
    return Promise.reject(err);
  };
  axios.interceptors.request.use(
    onRequestSuccess as any,
    onRequestError as any,
  );
  axios.interceptors.response.use(onResponseSuccess, onResponseError);
};

export default setupAxiosInterceptors;

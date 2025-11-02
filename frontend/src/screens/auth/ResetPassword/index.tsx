import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { verticalScale } from 'react-native-size-matters';

import { useAppTheme } from '../../../theme/theme.provider';
import * as styles from './styles';
import ControllerForm from '../../../components/common/controllerForm';
import Header from '../../../components/layout/header';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../../../services/auth';
import { AuthStackNames } from '../../../navigation/routes';

type FormResetPassword = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const { themed, theme } = useAppTheme();
  const { t } = useTranslation();
  const control = useForm<FormResetPassword>({
    defaultValues: { token: '', newPassword: '', confirmPassword: '' },
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    watch,
  } = control;

  const newPassword = watch('newPassword');

  const handleReset = async (data: FormResetPassword) => {
    setIsLoading(true);
    try {
      await resetPassword(data.token, data.newPassword, data.confirmPassword);
      navigation.navigate(AuthStackNames.ResetSuccess);
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      id: 'token',
      name: 'token',
      label: t('auth.resetPassword.token'),
      placeholder: t('auth.resetPassword.tokenPlaceholder'),
      type: 'input',
      error: errors?.token?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.resetPassword.tokenRequired'),
        },
      },
    },
    {
      id: 'newPassword',
      name: 'newPassword',
      label: t('auth.resetPassword.newPassword'),
      placeholder: t('auth.resetPassword.newPasswordPlaceholder'),
      type: 'password',
      error: errors?.newPassword?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.resetPassword.newPasswordRequired'),
        },
        minLength: {
          value: 8,
          message: t('auth.resetPassword.passwordMinLength'),
        },
      },
    },
    {
      id: 'confirmPassword',
      name: 'confirmPassword',
      label: t('auth.resetPassword.confirmPassword'),
      placeholder: t('auth.resetPassword.confirmPasswordPlaceholder'),
      type: 'password',
      error: errors?.confirmPassword?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.resetPassword.confirmPasswordRequired'),
        },
        validate: (value: string) =>
          value === newPassword || t('auth.resetPassword.passwordMismatch'),
      },
    },
  ];

  return (
    <SafeAreaView style={themed(styles.container)}>
      <Header title={t('auth.resetPassword.title')} />

      <ScrollView
        contentContainerStyle={themed(styles.scrollContainer)}
        keyboardShouldPersistTaps="handled"
      >
        <View style={themed(styles.formContainer)}>
          <Text style={themed(styles.description)}>
            {t('auth.resetPassword.description')}
          </Text>

          <View
            style={{
              marginBottom: verticalScale(theme.spacing.lg),
              marginTop: verticalScale(theme.spacing.lg),
            }}
          >
            <ControllerForm fields={fields} control={control} />
          </View>

          <TouchableOpacity
            style={themed(styles.primaryButton)}
            onPress={handleSubmit(handleReset)}
            disabled={
              !!errors.token ||
              !!errors.newPassword ||
              !!errors.confirmPassword ||
              isLoading
            }
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={themed(styles.primaryButtonText)}>
                {t('auth.resetPassword.submit')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {false && (
        <View style={themed(styles.loadingContainer)}>
          <ActivityIndicator />
        </View>
      )}
    </SafeAreaView>
  );
}

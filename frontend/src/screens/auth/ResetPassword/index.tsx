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
  otp: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const { themed, theme } = useAppTheme();
  const { t } = useTranslation();
  const control = useForm<FormResetPassword>({
    defaultValues: { otp: '', email: '', newPassword: '', confirmPassword: '' },
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
      await resetPassword(
        data.otp,
        data.email,
        data.newPassword,
        data.confirmPassword,
      );
      navigation.navigate(AuthStackNames.ResetSuccess);
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      id: 'otp',
      name: 'otp',
      label: t('auth.resetPassword.otp'),
      placeholder: t('auth.resetPassword.otpPlaceholder'),
      type: 'input',
      keyboardType: 'numeric',
      error: errors?.otp?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.resetPassword.otpRequired'),
        },
      },
    },
    {
      id: 'email',
      name: 'email',
      label: t('auth.resetPassword.email'),
      placeholder: t('auth.resetPassword.emailPlaceholder'),
      type: 'input',
      error: errors?.email?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.resetPassword.emailRequired'),
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
              !!errors.otp ||
              !!errors.email ||
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

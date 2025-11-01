import React from 'react';
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

type FormForgot = { email: string };

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const { themed, theme } = useAppTheme();
  const { t } = useTranslation();
  const control = useForm<FormForgot>({ defaultValues: { email: '' } });

  const {
    handleSubmit,
    formState: { errors },
  } = control;

  const handleReset = (_: FormForgot) => {
    navigation.navigate('VerifyCode');
  };

  const fields = [
    {
      id: 'email',
      name: 'email',
      label: t('auth.forgotPassword.email'),
      type: 'input',
      placeholder: t('auth.forgotPassword.enterEmail'),
      icon: 'mail-outline',
      error: errors?.email?.message,
      rules: {
        required: { value: true, message: t('auth.forgotPassword.emailRequired') },
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // simple email regex
          message: t('auth.forgotPassword.emailInvalid'),
        },
      },
    },
  ];

  return (
    <SafeAreaView style={themed(styles.container)}>
      <Header title={t('auth.forgotPassword.title')} navigation="Welcome" />

      <ScrollView
        contentContainerStyle={themed(styles.scrollContainer)}
        keyboardShouldPersistTaps="handled"
      >
        <View style={themed(styles.formContainer)}>
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
            disabled={!!errors.email}
          >
            <Text style={themed(styles.primaryButtonText)}>
              {t('auth.forgotPassword.resetPassword')}
            </Text>
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

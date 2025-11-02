import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { useAppTheme } from '../../../theme/theme.provider';
import * as styles from './styles';
import Header from '../../../components/layout/header';
import ControllerForm from '../../../components/common/controllerForm';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { createLawyerVerificationRequest } from '../../../services/verification';
import { MainStackNames } from '../../../navigation/routes';
import { File } from '../../../components/common/filePicker';

type FormLawyerVerification = {
  identity_card_front: File | null;
  identity_card_back: File | null;
  portrait: File | null;
  law_certificate: File | null;
  bachelor_degree: File | null;
  years_of_experience: string;
  current_job_position?: string;
};

export default function LawyerRegistrationScreen() {
  const [loading, setLoading] = useState(false);
  const { themed, theme } = useAppTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const { t } = useTranslation();

  const control = useForm<FormLawyerVerification>({
    defaultValues: {
      identity_card_front: null,
      identity_card_back: null,
      portrait: null,
      law_certificate: null,
      bachelor_degree: null,
      years_of_experience: '',
      current_job_position: '',
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = control;

  const fields = [
    {
      id: 'identity_card_front',
      name: 'identity_card_front',
      label: t('lawyerRegistration.identityCardFront'),
      type: 'file',
      fileType: 'image',
      error: errors?.identity_card_front?.message,
      rules: {
        required: {
          value: true,
          message: t('lawyerRegistration.identityCardFrontRequired'),
        },
      },
    },
    {
      id: 'identity_card_back',
      name: 'identity_card_back',
      label: t('lawyerRegistration.identityCardBack'),
      type: 'file',
      fileType: 'image',
      error: errors?.identity_card_back?.message,
      rules: {
        required: {
          value: true,
          message: t('lawyerRegistration.identityCardBackRequired'),
        },
      },
    },
    {
      id: 'portrait',
      name: 'portrait',
      label: t('lawyerRegistration.portrait'),
      type: 'file',
      fileType: 'image',
      error: errors?.portrait?.message,
      rules: {
        required: {
          value: true,
          message: t('lawyerRegistration.portraitRequired'),
        },
      },
    },
    {
      id: 'law_certificate',
      name: 'law_certificate',
      label: t('lawyerRegistration.lawCertificate'),
      type: 'file',
      fileType: 'file',
      error: errors?.law_certificate?.message,
      rules: {
        required: {
          value: true,
          message: t('lawyerRegistration.lawCertificateRequired'),
        },
      },
    },
    {
      id: 'bachelor_degree',
      name: 'bachelor_degree',
      label: t('lawyerRegistration.bachelorDegree'),
      type: 'file',
      fileType: 'file',
      error: errors?.bachelor_degree?.message,
      rules: {
        required: {
          value: true,
          message: t('lawyerRegistration.bachelorDegreeRequired'),
        },
      },
    },
    {
      id: 'years_of_experience',
      name: 'years_of_experience',
      label: t('lawyerRegistration.yearsOfExperience'),
      type: 'input',
      placeholder: t('lawyerRegistration.yearsOfExperiencePlaceholder'),
      keyboardType: 'numeric',
      error: errors?.years_of_experience?.message,
      rules: {
        required: {
          value: true,
          message: t('lawyerRegistration.yearsOfExperienceRequired'),
        },
        validate: (value: string) => {
          const num = parseInt(value, 10);
          if (isNaN(num) || num < 0) {
            return t('lawyerRegistration.yearsOfExperienceInvalid');
          }
          if (num > 50) {
            return t('lawyerRegistration.yearsOfExperienceTooHigh');
          }
          return true;
        },
      },
    },
    {
      id: 'current_job_position',
      name: 'current_job_position',
      label: t('lawyerRegistration.currentJobPosition'),
      type: 'input',
      placeholder: t('lawyerRegistration.currentJobPositionPlaceholder'),
      error: errors?.current_job_position?.message,
    },
  ];

  const onSubmit = async (data: FormLawyerVerification) => {
    // Validate all required files
    if (
      !data.identity_card_front ||
      !data.identity_card_back ||
      !data.portrait ||
      !data.law_certificate ||
      !data.bachelor_degree
    ) {
      return;
    }

    setLoading(true);
    try {
      await createLawyerVerificationRequest({
        identity_card_front: data.identity_card_front,
        identity_card_back: data.identity_card_back,
        portrait: data.portrait,
        law_certificate: data.law_certificate,
        bachelor_degree: data.bachelor_degree,
        years_of_experience: parseInt(data.years_of_experience, 10),
        current_job_position: data.current_job_position?.trim() || undefined,
      });

      navigation.navigate(MainStackNames.HomeTabs);
    } catch (error) {
      console.error('Failed to submit verification request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={themed(styles.container)}>
      <Header title={t('lawyerRegistration.title')} showBackButton={true} />
      <ScrollView
        style={themed(styles.scrollContainer)}
        contentContainerStyle={themed(styles.contentContainer)}
        keyboardShouldPersistTaps="handled"
      >
        <View style={themed(styles.headerSection)}>
          <Text style={themed(styles.headerTitle)}>
            {t('lawyerRegistration.headerTitle')}
          </Text>
          <Text style={themed(styles.headerDescription)}>
            {t('lawyerRegistration.headerDescription')}
          </Text>
        </View>

        <View style={themed(styles.formContainer)}>
          <ControllerForm fields={fields} control={control} />

          <TouchableOpacity
            style={[
              themed(styles.submitButton),
              loading && themed(styles.submitButtonDisabled),
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={themed(styles.submitButtonText)}>
                {t('lawyerRegistration.submitButton')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

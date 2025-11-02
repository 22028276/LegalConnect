import React from 'react';
import { useForm } from 'react-hook-form';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { useAppTheme } from '../../../theme/theme.provider';
import * as styles from './styles.ts';
import ControllerForm from '../../../components/common/controllerForm';
import Header from '../../../components/layout/header';
import { useTranslation } from 'react-i18next';
// @ts-ignore - React Native image module resolution
import AvatarPlaceholder from '../../../assets/imgs/Logo.png';
import { useAppDispatch, useAppSelector } from '../../../redux/hook.ts';
import {
  selectUser,
  updateLawyerProfile,
  updateUserProfile,
} from '../../../stores/user.slice.ts';
import { MainStackNames } from '../../../navigation/routes.ts';
import { useNavigation } from '@react-navigation/native';

type FormProfile = {
  username: string;
  email: string;
  phone_number: string;
  address: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  avatar: string;
};

export interface FormLawyer extends FormProfile {
  display_name: string;
  website_url: string;
  office_address: string;
  speaking_languages: string[];
  education: string;
}

export default function CompleteProfileScreen({}) {
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();

  const userData: FormProfile = {
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone_number: user?.phone_number ?? '',
    address: user?.address ?? '',
    avatar: user?.avatar ?? '',
    gender: 'Male',
    dob: dayjs().format('YYYY-MM-DD'),
  };
  const lawyerData: FormLawyer = {
    ...userData,
    display_name: '',
    website_url: '',
    office_address: '',
    speaking_languages: [],
    education: '',
  };

  const { themed } = useAppTheme();
  const control = useForm<FormProfile | FormLawyer>({
    defaultValues: user.role === 'lawyer' ? lawyerData : userData,
  });

  const {
    handleSubmit,
    formState: { errors },
  } = control;

  const fields = [
    {
      id: 'username',
      name: 'username',
      label: t('auth.completeProfile.username'),
      type: 'input',
      placeholder: t('auth.completeProfile.enterUsername'),
      error: errors?.username?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.completeProfile.userNameRequired'),
        },
      },
    },
    {
      id: 'phone_number',
      name: 'phone_number',
      label: t('auth.completeProfile.phone'),
      type: 'input',
      placeholder: t('auth.completeProfile.enterPhone'),
      error: errors?.phone_number?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.completeProfile.phoneRequired'),
        },
      },
    },
    {
      id: 'address',
      name: 'address',
      label: t('auth.completeProfile.address'),
      type: 'input',
      placeholder: t('auth.completeProfile.enterAddress'),
      error: errors?.address?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.completeProfile.addressRequired'),
        },
      },
    },
    {
      id: 'gender',
      name: 'gender',
      label: t('auth.completeProfile.gender'),
      type: 'radio',
      options: [
        { label: t('auth.completeProfile.male'), value: 'Male' },
        { label: t('auth.completeProfile.female'), value: 'Female' },
        { label: t('auth.completeProfile.other'), value: 'Other' },
      ],
      error: errors?.gender?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.completeProfile.genderRequired'),
        },
      },
    },
    {
      id: 'dob',
      name: 'dob',
      label: t('auth.completeProfile.dateOfBirth'),
      type: 'date',
      placeholder: 'YYYY-MM-DD',
      error: errors?.dob?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.completeProfile.dobRequired'),
        },
      },
    },
    {
      id: 'avatar',
      name: 'avatar',
      label: t('auth.completeProfile.avatar'),
      type: 'file',
      fileType: 'image',
      placeholder: t('auth.completeProfile.enterAvatar'),
      error: errors?.avatar?.message,
    },
  ];

  const lawyerFields = [
    {
      id: 'username',
      name: 'username',
      label: t('auth.completeProfile.username'),
      type: 'input',
      placeholder: t('auth.completeProfile.enterUsername'),
      error: errors?.username?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.completeProfile.userNameRequired'),
        },
      },
    },
    {
      id: 'phone_number',
      name: 'phone_number',
      label: t('auth.completeProfile.phone'),
      type: 'input',
      placeholder: t('auth.completeProfile.enterPhone'),
      error: errors?.phone_number?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.completeProfile.phoneRequired'),
        },
      },
    },
    {
      id: 'address',
      name: 'address',
      label: t('auth.completeProfile.address'),
      type: 'input',
      placeholder: t('auth.completeProfile.enterAddress'),
      error: errors?.address?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.completeProfile.addressRequired'),
        },
      },
    },
    {
      id: 'gender',
      name: 'gender',
      label: t('auth.completeProfile.gender'),
      type: 'radio',
      options: [
        { label: t('auth.completeProfile.male'), value: 'Male' },
        { label: t('auth.completeProfile.female'), value: 'Female' },
        { label: t('auth.completeProfile.other'), value: 'Other' },
      ],
      error: errors?.gender?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.completeProfile.genderRequired'),
        },
      },
    },
    {
      id: 'dob',
      name: 'dob',
      label: t('auth.completeProfile.dateOfBirth'),
      type: 'date',
      placeholder: 'YYYY-MM-DD',
      error: errors?.dob?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.completeProfile.dobRequired'),
        },
      },
    },

    {
      id: 'website_url',
      name: 'website_url',
      label: t('auth.completeProfile.websiteUrl'),
      type: 'input',
      placeholder: t('auth.completeProfile.enterWebsiteUrl'),
      error: errors?.website_url?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.completeProfile.websiteUrlRequired'),
        },
      },
    },
    {
      id: 'office_address',
      name: 'office_address',
      label: t('auth.completeProfile.officeAddress'),
      type: 'input',
      placeholder: t('auth.completeProfile.enterOfficeAddress'),
      error: errors?.office_address?.message,
      rules: {
        required: {
          value: true,
          message: t('auth.completeProfile.officeAddressRequired'),
        },
      },
    },
    {
      id: 'speaking_languages',
      name: 'speaking_languages',
      label: t('auth.completeProfile.speakingLanguages'),
      type: 'select',
      options: [
        { label: t('auth.completeProfile.english'), value: 'English' },
        { label: t('auth.completeProfile.vietnamese'), value: 'Vietnamese' },
        { label: t('auth.completeProfile.japanese'), value: 'Japanese' },
        { label: t('auth.completeProfile.korean'), value: 'Korean' },
        { label: t('auth.completeProfile.spanish'), value: 'Spanish' },
        { label: t('auth.completeProfile.french'), value: 'French' },
        { label: t('auth.completeProfile.german'), value: 'German' },
        { label: t('auth.completeProfile.italian'), value: 'Italian' },
        { label: t('auth.completeProfile.portuguese'), value: 'Portuguese' },
      ],
      mode: 'multiple',
    },
    {
      id: 'education',
      name: 'education',
      label: t('auth.completeProfile.education'),
      type: 'input',
      placeholder: t('auth.completeProfile.enterEducation'),
      error: errors?.education?.message,
    },
    {
      id: 'avatar',
      name: 'avatar',
      label: t('auth.completeProfile.avatar'),
      type: 'file',
      fileType: 'image',
      placeholder: t('auth.completeProfile.enterAvatar'),
      error: errors?.avatar?.message,
    },
  ];
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const onSubmit = (data: FormProfile | FormLawyer) => {
    if (user.role === 'lawyer') {
      const lawyer = data as FormLawyer;
      dispatch(updateLawyerProfile(lawyer));
    } else {
      dispatch(updateUserProfile(data));
    }
    navigation.navigate(MainStackNames.HomeTabs as never);
  };

  return (
    <SafeAreaView style={themed(styles.container)}>
      <Header
        title={t('auth.completeProfile.title')}
        showBackButton={true}
        navigation={
          !(user?.phone_number && user?.address) && user.role !== 'admin'
            ? MainStackNames.Setting
            : undefined
        }
      />
      <ScrollView
        contentContainerStyle={themed(styles.scrollContainer)}
        keyboardShouldPersistTaps="handled"
      >
        <View style={themed(styles.formContainer)}>
          <View style={themed(styles.avatarContainer)}>
            <Image source={AvatarPlaceholder} style={themed(styles.avatar)} />
          </View>

          <ControllerForm
            fields={user.role === 'lawyer' ? lawyerFields : fields}
            control={control}
          />

          <TouchableOpacity
            style={themed(styles.primaryButton)}
            onPress={handleSubmit(onSubmit)}
            disabled={
              !!errors.username ||
              !!errors.email ||
              !!errors.phone_number ||
              !!errors.address ||
              !!errors.gender ||
              !!errors.dob ||
              !!errors.avatar
            }
          >
            <Text style={themed(styles.primaryButtonText)}>
              {t('auth.completeProfile.continue')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

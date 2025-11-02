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
import { selectUser, updateUserProfile } from '../../../stores/user.slice.ts';
import { MainStackNames } from '../../../navigation/routes.ts';
import { useNavigation } from '@react-navigation/native';

type FormProfile = {
  username: string;
  email: string;
  phone_number: string;
  address: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  avatar_url: string;
};

export default function CompleteProfileScreen({}) {
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();

  const userData: FormProfile = {
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone_number: user?.phone_number ?? '',
    address: user?.address ?? '',
    avatar_url: user?.avatar_url ?? '',
    gender: 'Male',
    dob: dayjs().format('YYYY-MM-DD'),
  };
  const { themed } = useAppTheme();
  const control = useForm<FormProfile>({
    defaultValues: userData,
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
      id: 'avatar_url',
      name: 'avatar_url',
      label: t('auth.completeProfile.avatar'),
      type: 'file',
      fileType: 'image',
      placeholder: t('auth.completeProfile.enterAvatar'),
      error: errors?.avatar_url?.message,
    },
  ];
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const onSubmit = (data: FormProfile) => {
    dispatch(updateUserProfile(data));
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

          <ControllerForm fields={fields} control={control} />

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
              !!errors.avatar_url
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

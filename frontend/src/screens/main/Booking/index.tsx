import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { useAppTheme } from '../../../theme/theme.provider';
import * as styles from './styles.ts';
import Header from '../../../components/layout/header/index.tsx';
import ControllerForm from '../../../components/common/controllerForm/index.tsx';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import { Lawyer } from '../../../types/lawyer.ts';
import { createBookingRequest } from '../../../services/booking.ts';
import { fetchLawyerById } from '../../../stores/lawyer.slices.ts';
import { useAppDispatch } from '../../../redux/hook';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '../../../types/toast.ts';
import { MainStackNames } from '../../../navigation/routes.ts';

type FormBooking = {
  title: string;
  short_description: string;
  desired_start_time: Date | null;
  desired_end_time: Date | null;
  attachment?: {
    uri: string;
    type: string;
    name: string;
  };
};

export default function BookingScreen({
  route,
}: {
  route: RouteProp<
    {
      params: {
        lawyerId: string;
        scheduleId?: string;
        startTime?: string;
        endTime?: string;
      };
    },
    'params'
  >;
}) {
  const { lawyerId, startTime, endTime } = route.params;
  // scheduleId can be used later for tracking which schedule slot was selected
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(false);
  const [lawyerLoading, setLawyerLoading] = useState(true);

  const { themed, theme } = useAppTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<any>>();
  const { t } = useTranslation();

  const control = useForm<FormBooking>({
    defaultValues: {
      title: '',
      short_description: '',
      desired_start_time: startTime ? new Date(startTime) : null,
      desired_end_time: endTime ? new Date(endTime) : null,
      attachment: undefined,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = control;

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        const response = await dispatch(fetchLawyerById(lawyerId));
        setLawyer(response.payload);
      } catch (error) {
        console.error('Failed to fetch lawyer:', error);
        // Không cần báo lỗi, vẫn cho phép tạo booking với lawyerId
      } finally {
        setLawyerLoading(false);
      }
    };
    fetchLawyer();
  }, [dispatch, lawyerId]);

  const fields = [
    {
      id: 'title',
      name: 'title',
      label: t('booking.titleLabel'),
      type: 'input',
      placeholder: t('booking.titlePlaceholder'),
      error: errors?.title?.message,
      rules: {
        required: { value: true, message: t('booking.titleRequired') },
      },
    },
    {
      id: 'short_description',
      name: 'short_description',
      label: t('booking.shortDescription'),
      type: 'customRender',
      error: errors?.short_description?.message,
      rules: {
        required: { value: true, message: t('booking.descriptionRequired') },
      },
      // eslint-disable-next-line react/no-unstable-nested-components
      customRender: (value: string, onChange: (text: string) => void) => (
        <View style={themed(styles.textAreaContainer)}>
          <Text style={themed(styles.textAreaLabel)}>
            {t('booking.shortDescription')}
          </Text>
          <TextInput
            style={[
              themed(styles.textArea),
              errors.short_description && themed(styles.textAreaError),
            ]}
            value={value}
            onChangeText={onChange}
            placeholder={t('booking.shortDescriptionPlaceholder')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.short_description && (
            <Text style={themed(styles.errorText)}>
              {errors.short_description.message}
            </Text>
          )}
        </View>
      ),
    },
    {
      id: 'desired_start_time',
      name: 'desired_start_time',
      label: t('booking.startDate'),
      type: 'date',
      error: errors?.desired_start_time?.message,
      rules: {
        required: { value: true, message: t('booking.startDateRequired') },
        validate: (value: Date | null) => {
          if (!value) return true;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selectedDate = new Date(value);
          selectedDate.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            return t('booking.startDateInvalid');
          }
          return true;
        },
      },
      disabled: true,
    },
    {
      id: 'desired_end_time',
      name: 'desired_end_time',
      label: t('booking.endDate'),
      type: 'date',
      error: errors?.desired_end_time?.message,
      rules: {
        required: { value: true, message: t('booking.endDateRequired') },
        validate: (value: Date | null) => {
          if (!value) return true;
          const startTime = control.getValues('desired_start_time');
          if (startTime) {
            const startDate = new Date(startTime);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(value);
            endDate.setHours(0, 0, 0, 0);
            if (endDate < startDate) {
              return t('booking.endDateAfterStart');
            }
          }
          return true;
        },
      },
      disabled: true,
    },
    {
      id: 'attachment',
      name: 'attachment',
      label: t('booking.attachment'),
      type: 'file',
      error: errors?.attachment?.message,
      rules: {
        required: { value: true, message: t('booking.attachmentRequired') },
      },
    },
  ];

  const onSubmit = async (data: FormBooking) => {
    if (!data.desired_start_time || !data.desired_end_time) {
      return;
    }

    setLoading(true);
    try {
      await createBookingRequest({
        lawyer_id: lawyerId.toString(),
        title: data.title.trim(),
        short_description: data.short_description.trim(),
        desired_start_time: dayjs(data.desired_start_time).toISOString(),
        desired_end_time: dayjs(data.desired_end_time).toISOString(),
      });
      showSuccess(t('toast.bookingCreated'));
      navigation.navigate(MainStackNames.HomeTabs);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t('toast.bookingFailed');
      showError(t('toast.bookingFailed'), message);
    } finally {
      setLoading(false);
    }
  };

  if (lawyerLoading) {
    return (
      <SafeAreaView style={themed(styles.container)}>
        <Header title={t('booking.title')} showBackButton={true} />
        <View style={themed(styles.loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themed(styles.container)}>
      <Header title={t('booking.title')} showBackButton={true} />
      <ScrollView
        style={themed(styles.scrollContainer)}
        contentContainerStyle={themed(styles.contentContainer)}
        keyboardShouldPersistTaps="handled"
      >
        {lawyer && (
          <View style={themed(styles.lawyerInfo)}>
            <Image
              source={{ uri: lawyer.image_url }}
              style={themed(styles.lawyerAvatar)}
            />
            <Text style={themed(styles.lawyerName)}>{lawyer.display_name}</Text>
            <Text style={themed(styles.lawyerBio)}>{lawyer.email}</Text>
          </View>
        )}

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
                {t('booking.submitBookingRequest')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

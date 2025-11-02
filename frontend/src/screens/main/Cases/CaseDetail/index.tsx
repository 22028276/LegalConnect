import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../../components/layout/header';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../../../theme/theme.provider';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { Case, BookingRequest } from '../../../../types/case';
import Icon from '@react-native-vector-icons/ionicons';
import { moderateScale } from 'react-native-size-matters';
import * as styles from './styles';
import { useTranslation } from 'react-i18next';
import { MainStackNames } from '../../../../navigation/routes';
import { createNewConversation } from '../../../../stores/message.slice';
import { useAppDispatch, useAppSelector } from '../../../../redux/hook';
import {
  fetchPendingCaseById,
  fetchUserCaseById,
  selectCurrentCase,
  selectIsLoading,
} from '../../../../stores/case.slice';
import { AddNoteModal } from '../NoteModal';
import { AddFileModal } from '../AddFileModal';
import { store } from '../../../../redux/store';
import { selectRole } from '../../../../stores/user.slice';

type CaseDetailRouteProp = RouteProp<
  {
    params: {
      caseId: string;
      isPending: boolean;
    };
  },
  'params'
>;

export const CaseDetail = () => {
  const { themed, theme } = useAppTheme();
  const route = useRoute<CaseDetailRouteProp>();
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useAppDispatch();
  const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState(false);
  const [isAddFileModalVisible, setIsAddFileModalVisible] = useState(false);
  const { caseId, isPending } = route.params;
  const caseData = useAppSelector(selectCurrentCase);
  const isLoading = useAppSelector(selectIsLoading);
  const { t } = useTranslation();
  const isLawyer = selectRole(store.getState()) === 'lawyer';
  useEffect(() => {
    // Fetch case data based on type
    if (isPending) {
      dispatch(fetchPendingCaseById(caseId));
    } else {
      dispatch(fetchUserCaseById(caseId));
    }
  }, [dispatch, caseId, isPending]);

  // Show loading state
  if (isLoading || !caseData) {
    return (
      <SafeAreaView style={themed(styles.container)}>
        <Header title={t('caseDetail.loading')} showBackButton={true} />
        <View style={themed(styles.loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const displayCase = caseData;

  // Helper function to check if item is BookingRequest (pending case)
  const isBookingRequest = (
    item: Case | BookingRequest | null,
  ): item is BookingRequest => {
    return item !== null && 'short_description' in item && 'status' in item;
  };

  const isDisplayPending = isBookingRequest(displayCase);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'IN_PROGRESS':
        return theme.colors.processStatus.pending;
      case 'ACCEPTED':
      case 'APPROVED':
      case 'COMPLETED':
        return theme.colors.processStatus.approved;
      case 'DECLINED':
      case 'REJECTED':
      case 'CANCELLED':
        return theme.colors.processStatus.rejected;
      default:
        return theme.colors.processStatus.undefined;
    }
  };

  // Get status based on whether it's pending or active case
  const currentStatus = isDisplayPending
    ? displayCase.status
    : (displayCase as Case).state;
  const statusColors = getStatusColor(currentStatus);

  // Get description based on type
  const description = isDisplayPending
    ? displayCase.short_description
    : (displayCase as Case).description;

  // Get attachment URLs (only for Cases, not BookingRequests)
  const attachmentUrls = isDisplayPending
    ? []
    : (displayCase as Case).attachment_urls || [];

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleChatPress = async () => {
    try {
      const receiverId = isLawyer
        ? (displayCase as Case).client_id
        : (displayCase as Case).lawyer_id;
      const response = await dispatch(createNewConversation({ receiverId }));
      console.log('Full response:', JSON.stringify(response, null, 2));

      if (response?.payload) {
        const payload: any = response.payload;
        console.log('Payload:', payload);

        const conversationId =
          payload.id ||
          payload.conversation_id ||
          payload.participants?.[0]?.conversation_id;

        console.log('Conversation ID:', conversationId);

        if (!conversationId) {
          console.error('No conversation ID found in response');
          return;
        }

        const name = isLawyer
          ? payload.participants?.[0]?.user?.username ||
            t('lawyerProfile.lawyer')
          : payload.participants?.[1]?.user?.username ||
            t('clientProfile.client');
        const avatar = isLawyer
          ? payload.participants?.[0]?.user?.image_url || ''
          : payload.participants?.[1]?.user?.image_url || '';
        navigation.navigate(MainStackNames.ChatDetail, {
          chatId: conversationId,
          name,
          avatar,
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleAddNotePress = () => {
    console.log('Add note pressed');
    setIsAddNoteModalVisible(true);
  };

  const handleAddFilePress = () => {
    console.log('Add file pressed');
    setIsAddFileModalVisible(true);
  };

  const refetchCase = () => {
    if (isPending) {
      dispatch(fetchPendingCaseById(caseId));
    } else {
      dispatch(fetchUserCaseById(caseId));
    }
  };

  return (
    <SafeAreaView style={themed(styles.container)}>
      <Header
        title={displayCase.title}
        showBackButton={true}
        rightIcon={
          !isDisplayPending ? (
            <View style={themed(styles.headerActions)}>
              <TouchableOpacity onPress={handleAddFilePress}>
                <Icon
                  name="attach-outline"
                  size={moderateScale(24)}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddNotePress}>
                <Icon
                  name="add-outline"
                  size={moderateScale(24)}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
      <ScrollView
        style={themed(styles.scrollView)}
        contentContainerStyle={themed(styles.scrollContent)}
      >
        {/* Status Badge */}
        <View
          style={[
            themed(styles.statusBadge),
            { backgroundColor: statusColors.badgeColor },
          ]}
        >
          <Text
            style={[
              themed(styles.statusText),
              { color: statusColors.textColor },
            ]}
          >
            {currentStatus}
          </Text>
        </View>

        {/* Case Title */}
        <Text style={themed(styles.caseTitle)}>{displayCase.title}</Text>

        {/* Description Section */}
        <View style={themed(styles.section)}>
          <Text style={themed(styles.sectionTitle)}>
            {isDisplayPending
              ? t('caseDetail.requestDetails')
              : t('caseDetail.description')}
          </Text>
          <Text style={themed(styles.descriptionText)}>{description}</Text>
        </View>

        {/* Case Information - Show different info for pending vs active cases */}
        <View style={themed(styles.section)}>
          <Text style={themed(styles.sectionTitle)}>
            {isDisplayPending
              ? t('caseDetail.requestInformation')
              : t('caseDetail.caseInformation')}
          </Text>
          <View style={themed(styles.infoRow)}>
            <Icon
              name="calendar-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurface}
            />
            <View style={themed(styles.infoTextContainer)}>
              <Text style={themed(styles.infoLabel)}>
                {isDisplayPending
                  ? t('caseDetail.desiredStartTime')
                  : t('caseDetail.startedAt')}
              </Text>
              <Text style={themed(styles.infoValue)}>
                {formatDate(
                  isDisplayPending
                    ? displayCase.desired_start_time
                    : (displayCase as Case).started_at,
                )}
              </Text>
            </View>
          </View>
          <View style={themed(styles.infoRow)}>
            <Icon
              name="calendar-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurface}
            />
            <View style={themed(styles.infoTextContainer)}>
              <Text style={themed(styles.infoLabel)}>
                {isDisplayPending
                  ? t('caseDetail.desiredEndTime')
                  : t('caseDetail.expectedEnd')}
              </Text>
              <Text style={themed(styles.infoValue)}>
                {formatDate(
                  isDisplayPending
                    ? displayCase.desired_end_time
                    : (displayCase as Case).ending_time,
                )}
              </Text>
            </View>
          </View>
          <View style={themed(styles.infoRow)}>
            <Icon
              name="time-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurface}
            />
            <View style={themed(styles.infoTextContainer)}>
              <Text style={themed(styles.infoLabel)}>
                {t('caseDetail.lastUpdated')}
              </Text>
              <Text style={themed(styles.infoValue)}>
                {formatDate(displayCase.updated_at)}
              </Text>
            </View>
          </View>
        </View>

        {!isDisplayPending && (displayCase as Case).lawyer_note && (
          <View style={themed(styles.section)}>
            <Text style={themed(styles.sectionTitle)}>
              {t('caseDetail.lawyersNote')}
            </Text>
            <View style={themed(styles.noteContainer)}>
              <Text style={themed(styles.noteText)}>
                {(displayCase as Case).lawyer_note}
              </Text>
            </View>
          </View>
        )}

        {/* Client Note - Only for active cases */}
        {!isDisplayPending && (displayCase as Case).client_note && (
          <View style={themed(styles.section)}>
            <Text style={themed(styles.sectionTitle)}>
              {t('caseDetail.yourNote')}
            </Text>
            <View style={themed(styles.noteContainer)}>
              <Text style={themed(styles.noteText)}>
                {(displayCase as Case).client_note}
              </Text>
            </View>
          </View>
        )}

        {/* Attachments - Only for active cases with attachments */}
        {!isDisplayPending && attachmentUrls.length > 0 && (
          <View style={themed(styles.section)}>
            <Text style={themed(styles.sectionTitle)}>
              {t('caseDetail.attachments')} ({attachmentUrls.length})
            </Text>

            {attachmentUrls.length > 0 && (
              <>
                {attachmentUrls.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    style={themed(styles.attachmentItem)}
                    onPress={() => {
                      navigation.navigate(MainStackNames.PdfViewer, {
                        url: url,
                        title: t('caseDetail.attachmentNumber', {
                          number: index + 1,
                        }),
                      });
                    }}
                  >
                    <Icon
                      name="document-attach-outline"
                      size={moderateScale(24)}
                      color={theme.colors.primary}
                    />
                    <Text style={themed(styles.attachmentText)}>
                      {t('caseDetail.attachmentNumber', { number: index + 1 })}
                    </Text>
                    <Icon
                      name="chevron-forward-outline"
                      size={moderateScale(20)}
                      color={theme.colors.onSurface}
                    />
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={themed(styles.buttonContainer)}>
          <Pressable
            style={themed(styles.primaryButton)}
            onPress={handleChatPress}
          >
            <Icon
              name="chatbubble-outline"
              size={moderateScale(20)}
              color={theme.colors.onPrimary}
            />
            <Text style={themed(styles.primaryButtonText)}>
              {t('caseDetail.contactLawyer')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <AddNoteModal
        isAddNoteModalVisible={isAddNoteModalVisible}
        setIsAddNoteModalVisible={setIsAddNoteModalVisible}
        caseId={caseId}
        onSuccess={refetchCase}
      />
      <AddFileModal
        isVisible={isAddFileModalVisible}
        setIsVisible={setIsAddFileModalVisible}
        caseId={caseId}
        onSuccess={refetchCase}
      />
    </SafeAreaView>
  );
};

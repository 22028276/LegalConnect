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
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { pick, types } from '@react-native-documents/picker';
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
import { getBookingRequest, decideBookingRequest } from '../../../../services/booking';
import { getCaseById, updateCaseNotes, addCaseAttachment } from '../../../../services/case';
import { useAppSelector, useAppDispatch } from '../../../../redux/hook';
import { selectUser } from '../../../../stores/user.slice';
import { createNewConversation } from '../../../../stores/message.slice';

type CaseDetailRouteProp = RouteProp<
  { params: { caseData?: Case | BookingRequest } },
  'params'
>;

export const CaseDetail = () => {
  const { themed, theme } = useAppTheme();
  const route = useRoute<CaseDetailRouteProp>();
  const navigation = useNavigation<NavigationProp<any>>();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const caseData = route.params?.caseData;
  const [bookingRequestData, setBookingRequestData] = useState<BookingRequest | null>(null);
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLawyer, setIsLawyer] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Helper function to check if item is BookingRequest (pending case)
  const isBookingRequest = (
    item: Case | BookingRequest | undefined,
  ): item is BookingRequest => {
    return item !== undefined && 'short_description' in item && 'status' in item;
  };

  const isPending = isBookingRequest(caseData);

  // Fetch booking request or case details
  useEffect(() => {
    if (isPending && caseData?.id) {
      setIsLoading(true);
      getBookingRequest(caseData.id)
        .then(data => {
          setBookingRequestData(data);
        })
        .catch(error => {
          console.error('Failed to fetch booking request:', error);
          // Use the caseData if fetch fails
          setBookingRequestData(caseData as BookingRequest);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!isPending && caseData?.id) {
      // Fetch case details to get latest data
      setIsLoading(true);
      getCaseById(caseData.id)
        .then(data => {
          setCurrentCase(data);
        })
        .catch(error => {
          console.error('Failed to fetch case:', error);
          // Use the caseData if fetch fails
          setCurrentCase(caseData as Case);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isPending, caseData]);

  const displayCase = isPending 
    ? (bookingRequestData || caseData) 
    : (currentCase || caseData);

  // Determine user role relative to case
  useEffect(() => {
    if (!isPending && displayCase) {
      const caseItem = displayCase as Case;
      setIsLawyer(caseItem.lawyer_id === user?.id);
      setIsClient(caseItem.client_id === user?.id);
    }
  }, [isPending, displayCase, user?.id]);

  // Check if this is an incoming request (user is the lawyer, not the client)
  // Use the bookingRequestData if available, otherwise use caseData
  const bookingRequest = isPending 
    ? (bookingRequestData || caseData as BookingRequest)
    : null;

  const isIncomingRequest =
    isPending &&
    bookingRequest &&
    user?.id &&
    bookingRequest.lawyer_id === user.id &&
    bookingRequest.client_id !== user.id &&
    bookingRequest.status === 'PENDING';

  // Debug logging
  React.useEffect(() => {
    if (isPending && bookingRequest) {
      console.log('Booking Request Debug:', {
        isPending,
        lawyer_id: bookingRequest.lawyer_id,
        client_id: bookingRequest.client_id,
        user_id: user?.id,
        status: bookingRequest.status,
        isIncomingRequest,
      });
    }
  }, [isPending, bookingRequest, user?.id, isIncomingRequest]);

  const handleDecision = async (accept: boolean) => {
    if (!isPending || !bookingRequest) return;

    Alert.alert(
      accept ? t('caseDetail.acceptRequest') : t('caseDetail.declineRequest'),
      accept
        ? t('caseDetail.acceptRequestConfirm')
        : t('caseDetail.declineRequestConfirm'),
      [
        {
          text: t('caseDetail.cancel'),
          style: 'cancel',
        },
        {
          text: accept ? t('caseDetail.accept') : t('caseDetail.decline'),
          style: accept ? 'default' : 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const requestId = bookingRequest?.id || displayCase?.id;
              if (!requestId) {
                console.error('No booking request ID found');
                return;
              }
              const result = await decideBookingRequest(requestId, {
                accept,
              });
              // Update the booking request data with the response
              if (result?.booking) {
                setBookingRequestData(result.booking);
              } else if (result) {
                setBookingRequestData(result);
              }
              // Navigate back and refresh
              navigation.goBack();
            } catch (error) {
              console.error('Failed to decide booking request:', error);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
    );
  };

  // Handle contact button - navigate to chat
  const handleContact = async () => {
    if (!displayCase || !user?.id) return;

    try {
      let receiverId: string | null = null;
      let receiverName = '';

      if (isPending) {
        // For pending requests, contact the other party
        const request = displayCase as BookingRequest;
        if (user.id === request.client_id) {
          // Client contacting lawyer
          receiverId = request.lawyer_id;
          receiverName = t('caseDetail.lawyer');
        } else if (user.id === request.lawyer_id) {
          // Lawyer contacting client
          receiverId = request.client_id;
          receiverName = t('caseDetail.client');
        }
      } else {
        // For active cases
        const caseItem = displayCase as Case;
        if (user.id === caseItem.client_id) {
          // Client contacting lawyer
          receiverId = caseItem.lawyer_id;
          receiverName = t('caseDetail.lawyer');
        } else if (user.id === caseItem.lawyer_id) {
          // Lawyer contacting client
          receiverId = caseItem.client_id;
          receiverName = t('caseDetail.client');
        }
      }

      if (!receiverId) {
        console.error('Cannot determine receiver ID');
        return;
      }

      const response = await dispatch(
        createNewConversation({ receiverId }),
      );

      if (response?.payload) {
        const payload: any = response.payload;
        const conversationId =
          payload.id ||
          payload.conversation_id ||
          payload.participants?.[0]?.conversation_id;

        if (!conversationId) {
          console.error('No conversation ID found in response');
          return;
        }

        const otherParticipant = payload.participants?.find(
          (p: any) => p.user?.id === receiverId,
        );

        navigation.navigate(MainStackNames.ChatDetail, {
          chatId: conversationId,
          name: otherParticipant?.user?.username || receiverName,
          avatar: otherParticipant?.user?.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // Handle adding note (for lawyers)
  const handleAddNote = async () => {
    if (!displayCase || !isLawyer || isPending) return;

    setAddingNote(true);
    try {
      const caseItem = currentCase || (displayCase as Case);
      await updateCaseNotes(caseItem.id, {
        lawyer_note: noteText.trim() || null,
      });
      // Refresh case data
      const updatedCase = await getCaseById(caseItem.id);
      setCurrentCase(updatedCase);
      setShowNoteModal(false);
      setNoteText('');
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  // Handle adding attachment (for lawyers)
  const handleAddAttachment = async () => {
    if (!displayCase || !isLawyer || isPending) return;

    try {
      const res = await pick({
        type: [types.pdf, types.doc, types.docx, types.images],
        allowMultiSelection: false,
      });

      if (!res || res.length === 0) {
        return;
      }

      const file = res[0];
      setIsProcessing(true);

      const caseItem = currentCase || (displayCase as Case);
      await addCaseAttachment(caseItem.id, {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.name || 'attachment',
      });

      // Refresh case data
      const updatedCase = await getCaseById(caseItem.id);
      setCurrentCase(updatedCase);
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('Failed to add attachment:', error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!displayCase) {
    return (
      <SafeAreaView style={themed(styles.container)}>
        <Header title={t('caseDetail.title')} showBackButton={true} />
        <View style={themed(styles.scrollContent)}>
          <Text style={themed(styles.descriptionText)}>{t('cases.caseNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={themed(styles.container)}>
        <Header title={t('caseDetail.title')} showBackButton={true} />
        <View style={themed(styles.scrollContent)}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
  const currentStatus = isPending
    ? (displayCase as BookingRequest).status
    : (displayCase as Case).state;
  const statusColors = getStatusColor(currentStatus);

  // Get description based on type
  const description = isPending
    ? (displayCase as BookingRequest).short_description
    : (displayCase as Case).description;

  // Get attachment URLs (only for Cases, not BookingRequests)
  const attachmentUrls = isPending
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

  return (
    <SafeAreaView style={themed(styles.container)}>
      <Header title={displayCase.title} showBackButton={true} />
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
            {isPending
              ? t('caseDetail.requestDetails')
              : t('caseDetail.description')}
          </Text>
          <Text style={themed(styles.descriptionText)}>{description}</Text>
        </View>

        {/* Case Information - Show different info for pending vs active cases */}
        <View style={themed(styles.section)}>
          <Text style={themed(styles.sectionTitle)}>
            {isPending
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
                {isPending
                  ? t('caseDetail.desiredStartTime')
                  : t('caseDetail.startedAt')}
              </Text>
              <Text style={themed(styles.infoValue)}>
                {formatDate(
                  isPending
                    ? (displayCase as BookingRequest).desired_start_time
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
                {isPending
                  ? t('caseDetail.desiredEndTime')
                  : t('caseDetail.expectedEnd')}
              </Text>
              <Text style={themed(styles.infoValue)}>
                {formatDate(
                  isPending
                    ? (displayCase as BookingRequest).desired_end_time
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

        {/* Lawyer Note - Only for active cases */}
        {!isPending && (displayCase as Case).lawyer_note && (
          <View style={themed(styles.section)}>
            <View style={themed(styles.sectionHeader)}>
              <Text style={themed(styles.sectionTitle)}>
                {t('caseDetail.lawyersNote')}
              </Text>
              {isLawyer && (
                <TouchableOpacity
                  onPress={() => {
                    const caseItem = currentCase || (displayCase as Case);
                    setNoteText(caseItem.lawyer_note || '');
                    setShowNoteModal(true);
                  }}
                >
                  <Icon
                    name="create-outline"
                    size={moderateScale(20)}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={themed(styles.noteContainer)}>
              <Text style={themed(styles.noteText)}>
                {(displayCase as Case).lawyer_note}
              </Text>
            </View>
          </View>
        )}

        {/* Add Lawyer Note Button - Only for lawyers on active cases */}
        {!isPending && isLawyer && !(displayCase as Case).lawyer_note && (
          <View style={themed(styles.section)}>
            <TouchableOpacity
              style={themed(styles.addNoteButton)}
              onPress={() => {
                setNoteText('');
                setShowNoteModal(true);
              }}
            >
              <Icon
                name="add-circle-outline"
                size={moderateScale(20)}
                color={theme.colors.primary}
              />
              <Text style={themed(styles.addNoteButtonText)}>{t('caseDetail.addNote')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Client Note - Only for active cases */}
        {!isPending && (displayCase as Case).client_note && (
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

        {/* Attachments - Only for active cases */}
        {!isPending && (
          <View style={themed(styles.section)}>
            <View style={themed(styles.sectionHeader)}>
              <Text style={themed(styles.sectionTitle)}>
                {t('caseDetail.attachments')} ({attachmentUrls.length})
              </Text>
              {isLawyer && (
                <TouchableOpacity
                  onPress={handleAddAttachment}
                  disabled={isProcessing}
                >
                  <Icon
                    name="add-circle-outline"
                    size={moderateScale(20)}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
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
          {isIncomingRequest ? (
            <>
              <TouchableOpacity
                style={themed(styles.primaryButton)}
                onPress={() => handleDecision(true)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.onPrimary}
                  />
                ) : (
                  <>
                    <Icon
                      name="checkmark-circle-outline"
                      size={moderateScale(20)}
                      color={theme.colors.onPrimary}
                    />
                    <Text style={themed(styles.primaryButtonText)}>{t('caseDetail.accept')}</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={themed(styles.secondaryButton)}
                onPress={() => handleDecision(false)}
                disabled={isProcessing}
              >
                <Icon
                  name="close-circle-outline"
                  size={moderateScale(20)}
                  color={theme.colors.primary}
                />
                <Text style={themed(styles.secondaryButtonText)}>{t('caseDetail.decline')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={themed(styles.primaryButton)}
              onPress={handleContact}
            >
              <Icon
                name="chatbubble-outline"
                size={moderateScale(20)}
                color={theme.colors.onPrimary}
              />
              <Text style={themed(styles.primaryButtonText)}>
                {isLawyer ? t('caseDetail.contactClient') : t('caseDetail.contactLawyer')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Note Modal for Lawyers */}
        <Modal
          visible={showNoteModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowNoteModal(false)}
        >
          <View style={themed(styles.modalOverlay)}>
            <View style={themed(styles.modalContent)}>
              <View style={themed(styles.modalHeader)}>
                <Text style={themed(styles.modalTitle)}>{t('caseDetail.addNote')}</Text>
                <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                  <Icon
                    name="close-outline"
                    size={moderateScale(24)}
                    color={theme.colors.onSurface}
                  />
                </TouchableOpacity>
              </View>
              <TextInput
                style={themed(styles.modalTextInput)}
                multiline
                numberOfLines={6}
                placeholder={t('caseDetail.enterNote')}
                value={noteText}
                onChangeText={setNoteText}
                placeholderTextColor={theme.colors.onSurface + '80'}
              />
              <View style={themed(styles.modalButtons)}>
                <TouchableOpacity
                  style={themed(styles.modalCancelButton)}
                  onPress={() => {
                    setShowNoteModal(false);
                    setNoteText('');
                  }}
                >
                  <Text style={themed(styles.modalCancelButtonText)}>
                    {t('caseDetail.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={themed(styles.modalSaveButton)}
                  onPress={handleAddNote}
                  disabled={addingNote}
                >
                  {addingNote ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.onPrimary}
                    />
                  ) : (
                    <Text style={themed(styles.modalSaveButtonText)}>{t('caseDetail.save')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

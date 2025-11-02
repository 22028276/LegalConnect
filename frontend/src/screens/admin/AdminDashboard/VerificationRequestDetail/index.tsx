import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../../../theme/theme.provider';
import Header from '../../../../components/layout/header';
import * as styles from './styles';
import { VerificationRequestWithUser } from '../../../../types/verification';
import {
  getVerificationRequestById,
  approveVerificationRequest,
  rejectVerificationRequest,
} from '../../../../services/verification';
import { showError, showSuccess } from '../../../../types/toast';
import { moderateScale } from 'react-native-size-matters';
import Ionicons from '@react-native-vector-icons/ionicons';
import { MainStackNames } from '../../../../navigation/routes';
import { useTranslation } from 'react-i18next';

export default function VerificationRequestDetail({ route }: { route: any }) {
  const { requestId } = route.params;
  const { themed, theme } = useAppTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [request, setRequest] = useState<VerificationRequestWithUser | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const requestData = await getVerificationRequestById(requestId);
      setRequest(requestData);
    } catch (error: any) {
      showError(
        t('admin.error'),
        error?.response?.data?.message ||
          t('admin.failedToFetchRequestDetails'),
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  // Check if URL is a PDF based on extension
  const isPdfUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return cleanUrl.endsWith('.pdf');
  };

  // Check if URL is an image based on extension
  const isImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    return imageExtensions.some(ext => cleanUrl.endsWith(ext));
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t('admin.nA');
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

  // Handle document/image click
  const handleDocumentPress = (
    url: string | null | undefined,
    title: string,
  ) => {
    if (!url) return;

    if (isPdfUrl(url)) {
      // Navigate to PDF viewer
      navigation.navigate(MainStackNames.PdfViewer, {
        url: url,
        title: title,
      });
    } else if (isImageUrl(url)) {
      // Show in modal
      setSelectedImage({
        url: url,
        title: title,
      });
    } else {
      // Default to image modal for unknown types
      setSelectedImage({
        url: url,
        title: title,
      });
    }
  };

  const handleApprove = async () => {
    Alert.alert(
      t('admin.approveRequest'),
      t('admin.approveRequestConfirm', { userId: request?.id || 'this user' }),
      [
        { text: t('admin.cancel'), style: 'cancel' },
        {
          text: t('admin.approve'),
          style: 'default',
          onPress: async () => {
            try {
              await approveVerificationRequest(requestId);
              showSuccess(
                t('common.success'),
                t('admin.requestApprovedSuccessfully'),
              );
              navigation.goBack();
            } catch (error: any) {
              showError(
                t('admin.error'),
                error?.response?.data?.message ||
                  t('admin.failedToApproveRequest'),
              );
            }
          },
        },
      ],
    );
  };

  const handleReject = async () => {
    Alert.alert(
      t('admin.rejectRequest'),
      t('admin.rejectRequestPrompt'),
      [
        { text: t('admin.cancel'), style: 'cancel' },
        {
          text: t('admin.reject'),
          style: 'destructive',
          onPress: async (reason?: string) => {
            if (!reason || reason.trim().length === 0) {
              showError(t('admin.error'), t('admin.rejectionReasonRequired'));
              return;
            }
            try {
              await rejectVerificationRequest(requestId, reason.trim());
              showSuccess(
                t('common.success'),
                t('admin.requestRejectedSuccessfully'),
              );
              navigation.goBack();
            } catch (error: any) {
              showError(
                t('admin.error'),
                error?.response?.data?.message ||
                  t('admin.failedToRejectRequest'),
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={themed(styles.container)} edges={['top', 'bottom']}>
        <Header title={t('admin.requestDetails')} showBackButton />
        <View style={themed(styles.loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={themed(styles.container)} edges={['top', 'bottom']}>
        <Header title={t('admin.requestDetails')} showBackButton />
        <View style={themed(styles.loadingContainer)}>
          <Text style={themed(styles.infoValue)}>
            {t('admin.requestNotFound')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themed(styles.container)} edges={['top', 'bottom']}>
      <Header title={t('admin.verificationRequest')} showBackButton />

      <ScrollView contentContainerStyle={themed(styles.scrollContent)}>
        {/* Status Section */}
        <View style={themed(styles.statusContainer)}>
          {/* <View
            style={[
              themed(styles.statusBadge),
              { backgroundColor: statusColor as any },
            ]}
          >
            <Text style={themed(styles.statusText)}>
              {getStatusLabel(request.status)}
            </Text>
          </View> */}
          <Text style={themed(styles.statusDate)}>
            {t('admin.submitted')}: {formatDate(request.create_at)}
          </Text>
          {request.reviewed_at && (
            <Text style={themed(styles.statusDate)}>
              {t('admin.reviewed')}: {formatDate(request.reviewed_at)}
            </Text>
          )}
        </View>

        {/* User Information Section */}
        <View style={themed(styles.section)}>
          <Text style={themed(styles.sectionTitle)}>
            {t('admin.userInformation')}
          </Text>

          <View style={themed(styles.infoRow)}>
            <Ionicons
              name="person-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>{t('admin.fullName')}:</Text>
            <Text style={themed(styles.infoValue)}>
              {request?.user?.username || t('admin.nA')}
            </Text>
          </View>

          <View style={themed(styles.infoRow)}>
            <Ionicons
              name="mail-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>{t('admin.email')}:</Text>
            <Text style={themed(styles.infoValue)}>
              {request?.user?.email || t('admin.nA')}
            </Text>
          </View>

          <View style={themed(styles.infoRow)}>
            <Ionicons
              name="call-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>{t('admin.phone')}:</Text>
            <Text style={themed(styles.infoValue)}>
              {request?.user?.phone_number || t('admin.nA')}
            </Text>
          </View>

          <View style={themed(styles.infoRow)}>
            <Ionicons
              name="location-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>{t('admin.address')}:</Text>
            <Text style={themed(styles.infoValue)}>
              {request?.user?.address || t('admin.nA')}
            </Text>
          </View>

          {/* <View style={themed(styles.infoRow)}>
            <Ionicons
              name="calendar-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>Date of Birth:</Text>
            <Text style={themed(styles.infoValue)}>
              {request?.dob ? formatDate(request.dob) : 'N/A'}
            </Text>
          </View>

          <View style={themed(styles.infoRow)}>
            <Ionicons
              name="male-female-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>Gender:</Text>
            <Text style={themed(styles.infoValue)}>
              {request?.gender || 'N/A'}
            </Text>
          </View> */}

          <View style={themed(styles.divider)} />

          <View style={themed(styles.infoRow)}>
            <Ionicons
              name="key-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>{t('admin.userID')}:</Text>
            <Text style={themed(styles.infoValue)} numberOfLines={1}>
              {request.user_id}
            </Text>
          </View>

          {/* <View style={themed(styles.infoRow)}>
            <Ionicons
              name="shield-checkmark-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>Role:</Text>
            <Text style={themed(styles.infoValue)}>
              {userInfo?.role || 'N/A'}
            </Text>
          </View> */}
        </View>

        {/* Professional Information Section */}
        <View style={themed(styles.section)}>
          <Text style={themed(styles.sectionTitle)}>
            {t('admin.professionalInformation')}
          </Text>

          <View style={themed(styles.infoRow)}>
            <Ionicons
              name="briefcase-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>
              {t('admin.currentPosition')}:
            </Text>
            <Text style={themed(styles.infoValue)}>
              {request.current_job_position}
            </Text>
          </View>

          <View style={themed(styles.infoRow)}>
            <Ionicons
              name="time-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>
              {t('admin.yearsOfExperience')}:
            </Text>
            <Text style={themed(styles.infoValue)}>
              {request.years_of_experience} {t('admin.years')}
            </Text>
          </View>
        </View>

        {/* Verification Documents Section */}
        <View style={themed(styles.section)}>
          <Text style={themed(styles.sectionTitle)}>
            {t('admin.verificationDocuments')}
          </Text>

          <View style={themed(styles.imageGrid)}>
            {/* Row 1: Portrait Photo & ID Card Front */}
            <View style={themed(styles.imageRow)}>
              <View style={themed(styles.imageContainer)}>
                <Text style={themed(styles.imageLabel)}>
                  {t('admin.portraitPhoto')}
                </Text>
                <TouchableOpacity
                  style={themed(styles.imageCard)}
                  onPress={() =>
                    request.portrait_url &&
                    setSelectedImage({
                      url: request.portrait_url,
                      title: t('admin.portraitPhoto'),
                    })
                  }
                  disabled={!request.portrait_url}
                >
                  {request.portrait_url ? (
                    <Image
                      source={{ uri: request.portrait_url }}
                      style={themed(styles.image)}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={themed(styles.imagePlaceholder)}>
                      <Ionicons
                        name="person-outline"
                        size={moderateScale(32)}
                        color={theme.colors.onSurfaceVariant}
                      />
                      <Text style={themed(styles.imagePlaceholderText)}>
                        {t('admin.noImage')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={themed(styles.imageContainer)}>
                <Text style={themed(styles.imageLabel)}>
                  {t('admin.idCardFront')}
                </Text>
                <TouchableOpacity
                  style={themed(styles.imageCard)}
                  onPress={() =>
                    request.identity_card_front_url &&
                    setSelectedImage({
                      url: request.identity_card_front_url,
                      title: t('admin.idCardFront'),
                    })
                  }
                  disabled={!request.identity_card_front_url}
                >
                  {request.identity_card_front_url ? (
                    <Image
                      source={{ uri: request.identity_card_front_url }}
                      style={themed(styles.image)}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={themed(styles.imagePlaceholder)}>
                      <Ionicons
                        name="card-outline"
                        size={moderateScale(32)}
                        color={theme.colors.onSurfaceVariant}
                      />
                      <Text style={themed(styles.imagePlaceholderText)}>
                        {t('admin.noImage')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 2: ID Card Back & Law Certificate */}
            <View style={themed(styles.imageRow)}>
              <View style={themed(styles.imageContainer)}>
                <Text style={themed(styles.imageLabel)}>
                  {t('admin.idCardBack')}
                </Text>
                <TouchableOpacity
                  style={themed(styles.imageCard)}
                  onPress={() =>
                    request.identity_card_back_url &&
                    setSelectedImage({
                      url: request.identity_card_back_url,
                      title: t('admin.idCardBack'),
                    })
                  }
                  disabled={!request.identity_card_back_url}
                >
                  {request.identity_card_back_url ? (
                    <Image
                      source={{ uri: request.identity_card_back_url }}
                      style={themed(styles.image)}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={themed(styles.imagePlaceholder)}>
                      <Ionicons
                        name="card-outline"
                        size={moderateScale(32)}
                        color={theme.colors.onSurfaceVariant}
                      />
                      <Text style={themed(styles.imagePlaceholderText)}>
                        {t('admin.noImage')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={themed(styles.imageContainer)}>
                <Text style={themed(styles.imageLabel)}>
                  {t('admin.lawCertificate')}
                </Text>
                <TouchableOpacity
                  style={themed(styles.imageCard)}
                  onPress={() =>
                    handleDocumentPress(
                      request.law_certificate_url,
                      t('admin.lawCertificate'),
                    )
                  }
                  disabled={!request.law_certificate_url}
                >
                  {request.law_certificate_url ? (
                    isPdfUrl(request.law_certificate_url) ? (
                      <View style={themed(styles.pdfPreview)}>
                        <Ionicons
                          name="document-text"
                          size={moderateScale(48)}
                          color={theme.colors.primary}
                        />
                        <Text style={themed(styles.pdfLabel)}>
                          {t('admin.pdfDocumentLabel')}
                        </Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: request.law_certificate_url }}
                        style={themed(styles.image)}
                        resizeMode="cover"
                      />
                    )
                  ) : (
                    <View style={themed(styles.imagePlaceholder)}>
                      <Ionicons
                        name="document-text-outline"
                        size={moderateScale(32)}
                        color={theme.colors.onSurfaceVariant}
                      />
                      <Text style={themed(styles.imagePlaceholderText)}>
                        {t('admin.noDocument')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 3: Bachelor Degree */}
            <View style={themed(styles.imageRow)}>
              <View style={themed(styles.imageContainer)}>
                <Text style={themed(styles.imageLabel)}>
                  {t('admin.bachelorDegree')}
                </Text>
                <TouchableOpacity
                  style={themed(styles.imageCard)}
                  onPress={() =>
                    handleDocumentPress(
                      request.bachelor_degree_url,
                      t('admin.bachelorDegree'),
                    )
                  }
                  disabled={!request.bachelor_degree_url}
                >
                  {request.bachelor_degree_url ? (
                    isPdfUrl(request.bachelor_degree_url) ? (
                      <View style={themed(styles.pdfPreview)}>
                        <Ionicons
                          name="document-text"
                          size={moderateScale(48)}
                          color={theme.colors.primary}
                        />
                        <Text style={themed(styles.pdfLabel)}>
                          {t('admin.pdfDocumentLabel')}
                        </Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: request.bachelor_degree_url }}
                        style={themed(styles.image)}
                        resizeMode="cover"
                      />
                    )
                  ) : (
                    <View style={themed(styles.imagePlaceholder)}>
                      <Ionicons
                        name="school-outline"
                        size={moderateScale(32)}
                        color={theme.colors.onSurfaceVariant}
                      />
                      <Text style={themed(styles.imagePlaceholderText)}>
                        {t('admin.noDocument')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={themed(styles.imageContainer)} />
            </View>
          </View>
        </View>

        {/* Rejection Reason (if rejected) */}
        {request.status === 'rejected' && request.rejection_reason && (
          <View style={themed(styles.rejectionSection)}>
            <Text style={themed(styles.rejectionTitle)}>
              {t('admin.rejectionReason')}
            </Text>
            <Text style={themed(styles.rejectionText)}>
              {request.rejection_reason}
            </Text>
          </View>
        )}

        {/* Request Timeline */}
        <View style={themed(styles.section)}>
          <Text style={themed(styles.sectionTitle)}>
            {t('admin.requestTimeline')}
          </Text>

          <View style={themed(styles.infoRow)}>
            <Ionicons
              name="add-circle-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>{t('admin.created')}:</Text>
            <Text style={themed(styles.infoValue)}>
              {formatDate(request.create_at)}
            </Text>
          </View>

          <View style={themed(styles.infoRow)}>
            <Ionicons
              name="refresh-outline"
              size={moderateScale(20)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>
              {t('admin.lastUpdated')}:
            </Text>
            <Text style={themed(styles.infoValue)}>
              {formatDate(request.updated_at)}
            </Text>
          </View>

          {request.reviewed_at && (
            <View style={themed(styles.infoRow)}>
              <Ionicons
                name="checkmark-done-outline"
                size={moderateScale(20)}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={themed(styles.infoLabel)}>
                {t('admin.reviewed')}:
              </Text>
              <Text style={themed(styles.infoValue)}>
                {formatDate(request.reviewed_at)}
              </Text>
            </View>
          )}

          {request.reviewed_by_admin_id && (
            <View style={themed(styles.infoRow)}>
              <Ionicons
                name="person-circle-outline"
                size={moderateScale(20)}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={themed(styles.infoLabel)}>
                {t('admin.reviewedBy')}:
              </Text>
              <Text style={themed(styles.infoValue)} numberOfLines={1}>
                {request.reviewed_by_admin_id}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons (only for pending requests) */}
      {request.status === 'pending' && (
        <View style={themed(styles.actionContainer)}>
          <TouchableOpacity
            style={[themed(styles.actionButton), themed(styles.approveButton)]}
            onPress={handleApprove}
          >
            <Ionicons
              name="checkmark-outline"
              size={moderateScale(24)}
              color={theme.colors.inverseOnSurface}
            />
            <Text style={themed(styles.buttonText)}>
              {t('admin.approveRequest')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[themed(styles.actionButton), themed(styles.rejectButton)]}
            onPress={handleReject}
          >
            <Ionicons
              name="close-outline"
              size={moderateScale(24)}
              color={theme.colors.inverseOnSurface}
            />
            <Text style={themed(styles.buttonText)}>
              {t('admin.rejectRequest')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Image Preview Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={themed(styles.modalOverlay)}>
          <TouchableOpacity
            style={themed(styles.closeButton)}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={moderateScale(32)} color="#FFFFFF" />
          </TouchableOpacity>

          {selectedImage && (
            <>
              <Text style={themed(styles.imageTitle)}>
                {selectedImage.title}
              </Text>
              <View style={themed(styles.modalContent)}>
                <Image
                  source={{ uri: selectedImage.url }}
                  style={themed(styles.fullImage)}
                  resizeMode="contain"
                />
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useAppTheme } from '../../../../theme/theme.provider';
import Icon from '@react-native-vector-icons/ionicons';
import { moderateScale } from 'react-native-size-matters';
import * as styles from './styles';
import { useTranslation } from 'react-i18next';
import { rateCase } from '../../../../services/case';
import { showSuccess, showError } from '../../../../types/toast';

export interface RatingModalProps {
  isVisible: boolean;
  onClose: () => void;
  caseId: string;
  onSuccess?: () => void;
}

export const RatingModal = ({
  isVisible,
  onClose,
  caseId,
  onSuccess,
}: RatingModalProps) => {
  const { themed, theme } = useAppTheme();
  const { t } = useTranslation();
  const [stars, setStars] = useState<number>(0);
  const [detailedReview, setDetailedReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setStars(0);
    setDetailedReview('');
    onClose();
  };

  const handleStarPress = (rating: number) => {
    setStars(rating);
  };

  const handleSubmit = async () => {
    if (stars === 0) {
      showError(t('rating.selectStars'), t('rating.selectStarsMessage'));
      return;
    }

    setSubmitting(true);
    try {
      await rateCase(caseId, {
        stars,
        detailed_review: detailedReview.trim() || undefined,
      });
      showSuccess(t('rating.success'));
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      // Error toast already shown in service layer
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={themed(styles.starsContainer)}>
        {[1, 2, 3, 4, 5].map(rating => (
          <TouchableOpacity
            key={rating}
            onPress={() => handleStarPress(rating)}
            activeOpacity={0.7}
            style={themed(styles.starButton)}
          >
            <Icon
              name={rating <= stars ? 'star' : 'star-outline'}
              size={moderateScale(40)}
              color={
                rating <= stars
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
              }
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      onRequestClose={handleClose}
      transparent
      animationType="fade"
    >
      <Pressable style={themed(styles.modalOverlay)} onPress={handleClose}>
        <Pressable
          style={themed(styles.modalContainer)}
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View style={themed(styles.modalHeader)}>
            <Text style={themed(styles.modalTitle)}>{t('rating.title')}</Text>
            <TouchableOpacity
              style={themed(styles.closeButton)}
              onPress={handleClose}
              disabled={submitting}
            >
              <Icon
                name="close"
                size={moderateScale(24)}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={themed(styles.modalContent)}>
            {/* Stars Rating */}
            <View style={themed(styles.ratingSection)}>
              <Text style={themed(styles.ratingLabel)}>
                {t('rating.selectRating')}
              </Text>
              {renderStars()}
              {stars > 0 && (
                <Text style={themed(styles.selectedRatingText)}>
                  {t('rating.selected')}: {stars}/5
                </Text>
              )}
            </View>

            {/* Detailed Review */}
            <View style={themed(styles.reviewSection)}>
              <Text style={themed(styles.reviewLabel)}>
                {t('rating.detailedReview')}
              </Text>
              <TextInput
                style={themed(styles.textInput)}
                placeholder={t('rating.reviewPlaceholder')}
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={detailedReview}
                onChangeText={setDetailedReview}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={themed(styles.characterCount)}>
                {detailedReview.length}/500
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={themed(styles.modalFooter)}>
            <TouchableOpacity
              style={themed(styles.cancelButton)}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={themed(styles.cancelButtonText)}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                themed(styles.submitButton),
                (stars === 0 || submitting) &&
                  themed(styles.submitButtonDisabled),
              ]}
              onPress={handleSubmit}
              disabled={stars === 0 || submitting}
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.onPrimary}
                />
              ) : (
                <Text style={themed(styles.submitButtonText)}>
                  {t('common.submit')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  ImageStyle,
  TextStyle,
} from 'react-native';
import { useAppTheme } from '../../../theme/theme.provider';
import { moderateScale } from 'react-native-size-matters';
import Icon from '@react-native-vector-icons/ionicons';
import * as styles from './styles';
import { ThemedStyle } from '../../../theme';
import { Case } from '../../../types/case';
import { useTranslation } from 'react-i18next';
import { selectRole } from '../../../stores/user.slice';
import { store } from '../../../redux/store';

export interface CaseCardProps {
  caseData: Case;
  onPress?: () => void;
  onRatePress?: () => void;
  stylesOverride?: CaseCardStylesOverride;
}

export interface CaseCardStylesOverride {
  cardContainer?: ThemedStyle<ViewStyle>;
  headerSection?: ThemedStyle<ViewStyle>;
  profileSection?: ThemedStyle<ViewStyle>;
  profileImage?: ThemedStyle<ImageStyle>;
  titleSection?: ThemedStyle<ViewStyle>;
  titleText?: ThemedStyle<TextStyle>;
  lawyerText?: ThemedStyle<TextStyle>;
  activityText?: ThemedStyle<TextStyle>;
}

export default function CaseCard({
  caseData,
  onPress,
  onRatePress,
  stylesOverride,
}: CaseCardProps) {
  const { themed, theme } = useAppTheme();
  const { t } = useTranslation();
  const role = selectRole(store.getState());
  if (!caseData) {
    return null;
  }
  const {
    title = '',
    description = '',
    state = 'IN_PROGRESS',
    attachment_urls = [],
    updated_at = '',
  } = (caseData as any) ?? {};

  const getStatusColor = (caseStatus: string) => {
    switch (caseStatus) {
      case 'PENDING':
        return theme.colors.processStatus.pending;
      case 'IN_PROGRESS':
        return theme.colors.processStatus.pending;
      case 'COMPLETED':
        return theme.colors.processStatus.approved;
      case 'CANCELLED':
        return theme.colors.processStatus.rejected;
      default:
        return theme.colors.processStatus.undefined;
    }
  };

  const getStatusLabel = (caseStatus: string) => {
    return t(`cases.${caseStatus.toLowerCase()}`);
  };

  const statusColors = getStatusColor(state);
  const statusLabel = getStatusLabel(state);

  return (
    <TouchableOpacity
      style={[
        themed(styles.cardContainer),
        themed(stylesOverride?.cardContainer),
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header Section */}
      <View
        style={[
          themed(styles.headerSection),
          themed(stylesOverride?.headerSection),
        ]}
      >
        <View style={themed(styles.profileSection)}>
          <Icon
            name="briefcase-outline"
            size={moderateScale(theme.fontSizes.lg)}
            color={theme.colors.onSurface}
          />
          <View
            style={[
              themed(styles.titleSection),
              themed(stylesOverride?.titleSection),
            ]}
          >
            <Text style={themed(styles.titleText)} numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>

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
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Description and Attachment aligned with icon */}
      <View style={themed(styles.detailsSection)}>
        <Text
          style={[
            themed(styles.lawyerText),
            themed(stylesOverride?.lawyerText),
          ]}
          numberOfLines={1}
        >
          <Text style={themed(styles.labelText)}>
            {t('cases.description')}:{' '}
          </Text>
          {description}
        </Text>
        <Text
          style={[
            themed(styles.activityText),
            themed(stylesOverride?.activityText),
          ]}
          numberOfLines={1}
        >
          <Text style={themed(styles.labelText)}>
            {t('cases.attachment')}:{' '}
          </Text>
          {attachment_urls?.length || 0}
        </Text>
      </View>
      {/* Additional content can be added here if needed */}

      {/* Footer Section */}
      <View style={themed(styles.footerSection)}>
        <Text style={themed(styles.lastUpdatedText)}>
          {t('cases.updated')}: {updated_at}
        </Text>
      </View>

      {/* Rating Button - Only show when status is COMPLETED */}
      {state === 'COMPLETED' && role === 'client' && (
        <TouchableOpacity
          style={themed(styles.ratingButton)}
          onPress={e => {
            e.stopPropagation();
            onRatePress?.();
          }}
          activeOpacity={0.8}
        >
          <Icon
            name="star-outline"
            size={moderateScale(theme.fontSizes.md)}
            color={theme.colors.primary}
          />
          <Text style={themed(styles.ratingButtonText)}>{t('cases.rate')}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

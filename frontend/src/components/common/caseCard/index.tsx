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

export interface CaseCardProps {
  caseData: Case;
  onPress?: () => void;
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
  stylesOverride,
}: CaseCardProps) {
  const { themed, theme } = useAppTheme();
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

  const statusColors = getStatusColor(state);

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
            {state}
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
          <Text style={themed(styles.labelText)}>Description: </Text>
          {description}
        </Text>
        <Text
          style={[
            themed(styles.activityText),
            themed(stylesOverride?.activityText),
          ]}
          numberOfLines={1}
        >
          <Text style={themed(styles.labelText)}>Attachment: </Text>
          {attachment_urls?.length || 0}
        </Text>
      </View>
      {/* Additional content can be added here if needed */}

      {/* Footer Section */}
      <View style={themed(styles.footerSection)}>
        <Text style={themed(styles.lastUpdatedText)}>
          Updated: {updated_at}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

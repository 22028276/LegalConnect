import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { ThemedStyle } from '../../../theme';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export const cardContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderRadius: moderateScale(8),
  padding: moderateScale(spacing.sm),
  marginVertical: verticalScale(spacing.xxxs),
  marginHorizontal: moderateScale(spacing.xs),
  shadowColor: colors.shadow,
  shadowOffset: {
    width: 0,
    height: moderateScale(1),
  },
  shadowOpacity: 0.08,
  shadowRadius: moderateScale(2),
  elevation: 2,
  width: moderateScale(280),
});

export const headerSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: verticalScale(spacing.xs),
});

export const profileSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  flex: 1,
  marginRight: moderateScale(spacing.sm),
});

export const profileImage: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  width: moderateScale(spacing.xxxxl),
  height: moderateScale(spacing.xxxxl),
  borderRadius: moderateScale(8),
  marginRight: moderateScale(spacing.xs),
  marginTop: scale(spacing.xxs),
});

export const titleSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: 'center',
  marginLeft: scale(spacing.sm),
});

export const titleText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  fontWeight: 'bold',
  color: colors.onSurface,
  marginBottom: verticalScale(spacing.xxs),
});

export const lawyerText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurfaceVariant,
  marginBottom: verticalScale(spacing.xxxs),
});

export const activityText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurfaceVariant,
});

export const labelText: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurface,
  fontWeight: '600',
});

export const detailsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: verticalScale(spacing.xs),
});

export const statusBadge: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: moderateScale(spacing.xs),
  paddingVertical: verticalScale(spacing.xxxs),
  borderRadius: moderateScale(12),
  borderWidth: 1,
  borderColor: colors.outline,
});

export const statusText: ThemedStyle<TextStyle> = ({ fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  fontWeight: '500',
});

export const currentTaskText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurface,
  marginBottom: verticalScale(spacing.xxxs),
  fontWeight: '500',
});

export const progressSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: verticalScale(spacing.xxxs),
});

export const progressBarContainer: ThemedStyle<ViewStyle> = ({}) => ({
  flexDirection: 'row',
  alignItems: 'center',
});

export const progressBarBackground: ThemedStyle<ViewStyle> = ({
  colors,
  spacing,
}) => ({
  flex: 1,
  height: moderateScale(4),
  backgroundColor: colors.surfaceVariant,
  borderRadius: moderateScale(2),
  marginRight: moderateScale(spacing.xs),
});

export const progressBarFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: '100%',
  backgroundColor: colors.primary,
  borderRadius: moderateScale(2),
});

export const progressText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurface,
  fontWeight: '500',
  minWidth: moderateScale(28),
  textAlign: 'right',
});

export const footerSection: ThemedStyle<ViewStyle> = () => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const commentsSection: ThemedStyle<ViewStyle> = ({}) => ({
  flexDirection: 'row',
  alignItems: 'center',
});

export const commentsText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.xs),
  color: colors.onSurface,
  marginLeft: moderateScale(spacing.xxxs),
});

export const lastUpdatedText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurfaceVariant,
});

export default {
  cardContainer,
  headerSection,
  profileSection,
  profileImage,
  titleSection,
  titleText,
  lawyerText,
  activityText,
  labelText,
  detailsSection,
  statusBadge,
  statusText,
  currentTaskText,
  progressSection,
  progressBarContainer,
  progressBarBackground,
  progressBarFill,
  progressText,
  footerSection,
  commentsSection,
  commentsText,
  lastUpdatedText,
};

import { ThemedStyle } from '../../../theme';
import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export const container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
});

export const profileSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: 'center',
  paddingTop: verticalScale(spacing.lg),
  paddingBottom: verticalScale(spacing.lg),
});

export const avatarContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: scale(spacing.xxxxl),
  height: scale(spacing.xxxxl),
  borderRadius: scale(spacing.xxxxl) / 2,
  marginBottom: verticalScale(spacing.sm),
  overflow: 'hidden',
});

export const avatar: ThemedStyle<ImageStyle> = ({}) => ({
  width: '100%',
  height: '100%',
});

export const profileName: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.xl),
  fontWeight: '600',
  color: colors.onBackground,
});

export const profileEmail: ThemedStyle<TextStyle> = ({
  colors,
  spacing,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onBackground,
  marginTop: verticalScale(spacing.xxs),
  marginBottom: verticalScale(spacing.md),
});

export const editButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.primary,
  paddingVertical: verticalScale(spacing.xs),
  paddingHorizontal: scale(spacing.xl),
  borderRadius: moderateScale(spacing.lg),
});

export const editButtonText: ThemedStyle<TextStyle> = ({
  fontSizes,
  colors,
}) => ({
  color: colors.onPrimary,
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '600',
});

export const section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: scale(spacing.md),
  marginBottom: verticalScale(spacing.xl),
});

export const sectionTitle: ThemedStyle<TextStyle> = ({
  colors,
  spacing,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onBackground,
  textTransform: 'uppercase',
  marginBottom: verticalScale(spacing.xs),
  paddingLeft: scale(spacing.md),
  fontWeight: 'bold',
});

export const group: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surfaceContainer,
  borderRadius: moderateScale(spacing.sm),
  overflow: 'hidden',
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: verticalScale(spacing.xxxs) },
  shadowOpacity: 0.2,
  shadowRadius: moderateScale(3.84),
  elevation: moderateScale(5),
});

export const row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: scale(spacing.md),
  paddingVertical: verticalScale(spacing.sm),
  gap: scale(spacing.md),
});

export const rowLabel: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  flex: 1,
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurface,
});

export const logoutLabel: ThemedStyle<TextStyle> = ({ fontSizes }) => ({
  flex: 1,
  fontSize: moderateScale(fontSizes.md),
  color: '#FF3B30',
});

export const rowValueContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: scale(spacing.xxs),
});

export const rowValue: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurface,
});

export const separator: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: verticalScale(spacing.xxxxs),
  backgroundColor: colors.outlineVariant,
  // marginLeft: scale(spacing.xxxxxl),
});

import { ViewStyle, TextStyle } from 'react-native';
import { ThemedStyle } from '../../../theme';
import { moderateScale, verticalScale } from 'react-native-size-matters';

export const headerContainer: ThemedStyle<any> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: verticalScale(spacing.sm),
  gap: moderateScale(spacing.sm),
});

export const searchContainer: ThemedStyle<any> = () => ({
  flex: 1,
});

export const profileButton: ThemedStyle<any> = ({ colors }) => ({
  width: moderateScale(44),
  height: moderateScale(44),
  borderRadius: moderateScale(22),
  backgroundColor: colors.primary,
  justifyContent: 'center',
  alignItems: 'center',
});

export const simpleContainer: ThemedStyle<ViewStyle> = ({
  colors,
  spacing,
}) => ({
  flex: 1,
  backgroundColor: colors.background,
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: spacing.xs,
  paddingHorizontal: spacing.sm,
});

export const simpleTitle: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: fontSizes.xxl,
  color: colors.onBackground,
  fontWeight: '700',
  textAlign: 'center',
  alignSelf: 'center',
});

export const simpleCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: '100%',
  backgroundColor: colors.surface,
  borderRadius: 12,
  paddingVertical: verticalScale(spacing.sm),
  marginBottom: verticalScale(spacing.sm),
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
});

export const simpleCardTitle: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.xl),
  color: colors.onSurface,
  fontWeight: '600',
  marginBottom: verticalScale(spacing.xs),
  textAlign: 'center',
});

export const simpleLargeNumber: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.xl),
  color: colors.onSurface,
  fontWeight: 'bold',
  marginBottom: verticalScale(spacing.xs),
  textAlign: 'center',
});

export const simpleButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: '90%',
  backgroundColor: colors.primary,
  paddingVertical: verticalScale(spacing.xs),
  borderRadius: 8,
  alignItems: 'center',
  marginTop: verticalScale(spacing.xs),
  marginBottom: 2,
});

export const simpleButtonText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  color: colors.onPrimary,
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '500',
  textAlign: 'center',
});

export const simpleDescription: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurfaceVariant,
  textAlign: 'center',
  marginBottom: verticalScale(spacing.xs),
  paddingHorizontal: moderateScale(spacing.md),
});

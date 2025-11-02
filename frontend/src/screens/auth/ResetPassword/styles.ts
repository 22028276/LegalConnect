import { TextStyle, ViewStyle } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { ThemedStyle } from '../../../theme';

export const container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
});

export const scrollContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  justifyContent: 'flex-start',
  paddingHorizontal: scale(spacing.md),
  paddingTop: verticalScale(spacing.lg),
  paddingBottom: verticalScale(spacing.xl),
});

export const formContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: 'center',
});

export const description: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurfaceVariant,
  textAlign: 'center',
  marginTop: verticalScale(spacing.md),
  lineHeight: moderateScale(20),
});

export const primaryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.primary,
  paddingVertical: verticalScale(spacing.md),
  borderRadius: moderateScale(spacing.sm),
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: verticalScale(spacing.lg),
});

export const primaryButtonText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  color: colors.onPrimary,
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '700',
});

export const loadingContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

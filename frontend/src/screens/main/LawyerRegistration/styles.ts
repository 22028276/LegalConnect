import { ThemedStyle } from '../../../theme';
import { TextStyle, ViewStyle } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

export const container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
});

export const scrollContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

export const contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: verticalScale(spacing.xl),
});

export const headerSection: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: verticalScale(spacing.lg),
  backgroundColor: colors.surface,
  marginBottom: verticalScale(spacing.md),
});

export const headerTitle: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.xl),
  fontWeight: '700',
  color: colors.onSurface,
  marginBottom: verticalScale(8),
});

export const headerDescription: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurfaceVariant,
  lineHeight: moderateScale(fontSizes.md * 1.5),
});

export const formContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: moderateScale(spacing.md),
});

export const submitButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.primary,
  paddingVertical: verticalScale(spacing.md),
  borderRadius: moderateScale(12),
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: verticalScale(spacing.lg),
  shadowColor: colors.shadow,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
});

export const submitButtonDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surfaceVariant,
  opacity: 0.6,
});

export const submitButtonText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.lg),
  fontWeight: '600',
  color: colors.onPrimary,
});

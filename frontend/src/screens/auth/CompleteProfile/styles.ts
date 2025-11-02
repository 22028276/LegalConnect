import { ThemedStyle } from '../../../theme';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export const container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background || '#F5F7FA',
});

export const scrollContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: scale(spacing.lg),
});

export const formContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: verticalScale(spacing.sm),
});

export const avatarContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: 'center',
  marginVertical: verticalScale(spacing.md),
});

export const avatarWrapper: ThemedStyle<ViewStyle> = () => ({
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
});

export const avatar: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  width: scale(spacing.xxxxxxxxxxl),
  height: scale(spacing.xxxxxxxxxxl),
  borderRadius: scale(spacing.xxxxxxxxxxl) / 2,
  backgroundColor: '#E0E0E0',
});

export const cameraButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: scale(spacing.xl),
  height: scale(spacing.xl),
  borderRadius: scale(spacing.xl) / 2,
  backgroundColor: colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: colors.background,
  elevation: 5,
  zIndex: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
});

export const primaryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.primary || '#123E86',
  paddingVertical: verticalScale(spacing.md),
  borderRadius: scale(8),
  alignItems: 'center',
  marginTop: verticalScale(spacing.lg),
});

export const primaryButtonText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  color: colors.onPrimary || '#FFFFFF',
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '600',
});

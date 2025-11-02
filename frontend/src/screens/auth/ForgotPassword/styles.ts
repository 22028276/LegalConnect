import { ThemedStyle } from '../../../theme';
import { TextStyle, ViewStyle } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

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

export const formContainer: ThemedStyle<ViewStyle> = () => ({});

export const welcomeTitle: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.xl),
  fontWeight: '800',
  color: colors.onBackground,
  textAlign: 'left',
});

export const primaryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: '100%',
  height: verticalScale(spacing.xxxxl),
  backgroundColor: colors.primary,
  borderRadius: scale(spacing.sm),
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: verticalScale(spacing.lg),
});

export const primaryButtonText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  color: colors.onPrimary,
  fontWeight: '700',
  fontSize: moderateScale(fontSizes.md),
});

export const loadingContainer: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
});

export const backButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: 'absolute',
  top: verticalScale(spacing.sm),
  left: scale(spacing.sm),
  paddingVertical: verticalScale(spacing.xxs),
  paddingHorizontal: scale(spacing.xs),
  zIndex: 10,
});

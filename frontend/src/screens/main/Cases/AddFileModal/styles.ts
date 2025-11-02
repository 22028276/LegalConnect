import { ThemedStyle } from '../../../../theme';
import { TextStyle, ViewStyle } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

export const modalOverlay: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.35)',
  justifyContent: 'center',
  alignItems: 'center',
});

export const modalBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: verticalScale(spacing.lg),
  width: '94%',
  shadowColor: colors.shadow,
  shadowOpacity: 0.1,
  shadowRadius: 16,
  elevation: 9,
});

export const modalTitle: ThemedStyle<TextStyle> = ({ fontSizes, colors }) => ({
  fontWeight: '700',
  fontSize: moderateScale(fontSizes.xl),
  marginBottom: verticalScale(10),
  color: colors.onSurface,
});

export const fileHintText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurfaceVariant,
  marginTop: moderateScale(spacing.xs),
  marginBottom: moderateScale(spacing.xs),
  textAlign: 'center',
});

export const errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginVertical: verticalScale(spacing.xxs),
});

export const buttonRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: verticalScale(spacing.sm),
});

export const cancelButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minWidth: 78,
  paddingVertical: verticalScale(spacing.xs),
  alignItems: 'center',
  justifyContent: 'center',
});

export const cancelButtonText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  color: colors.outline,
  fontSize: moderateScale(fontSizes.md),
});

export const submitBtn: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.primary,
  marginLeft: moderateScale(spacing.md),
  minWidth: 78,
  paddingVertical: verticalScale(spacing.xs),
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
});

export const submitBtnText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  color: colors.onPrimary,
  fontWeight: '700',
  fontSize: moderateScale(fontSizes.md),
});

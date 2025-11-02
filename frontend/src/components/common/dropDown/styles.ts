import { ThemedStyle } from '../../../theme';
import { TextStyle, ViewStyle } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export const container: ThemedStyle<ViewStyle> = () => ({
  width: '100%',
});

export const transparent: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.transparent,
  borderTopColor: colors.transparent,
  borderBottomColor: colors.transparent,
});

export const label: ThemedStyle<TextStyle> = ({
  fontSizes,
  spacing,
  colors,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onBackground,
  fontWeight: 'bold',
  marginLeft: moderateScale(spacing.md),
  marginBottom: verticalScale(spacing.xxs),
});

export const inputContainer: ThemedStyle<ViewStyle> = ({
  colors,
  spacing,
}) => ({
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: scale(spacing.xxxxs),
  borderColor: colors.outline,
  borderRadius: scale(spacing.sm),
  backgroundColor: colors.surfaceContainer,
  paddingHorizontal: scale(spacing.md),
  paddingVertical: verticalScale(spacing.xs),
  minHeight: verticalScale(48),
});

export const inputContainerError: ThemedStyle<ViewStyle> = ({
  colors,
  spacing,
}) => ({
  borderColor: colors.error,
  borderWidth: scale(spacing.xxxs),
});

export const buttonPlaceholder: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  color: colors.outline,
  fontSize: moderateScale(fontSizes.md),
});

export const buttonText: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  color: colors.onBackground,
  fontSize: moderateScale(fontSizes.md),
});

export const itemText: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  color: colors.onBackground,
  fontSize: moderateScale(fontSizes.sm),
});

export const errorText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  color: colors.error,
  fontSize: moderateScale(fontSizes.sm),
  marginLeft: scale(spacing.sm),
});

export const containerStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surfaceContainerHighest,
});

export const inputSearchStyle: ThemedStyle<ViewStyle> = ({
  colors,
  spacing,
}) => ({
  backgroundColor: colors.surfaceContainerHigh,
  color: colors.onSurface,
  borderRadius: scale(spacing.lg),
  borderColor: colors.outline,
});

import { ThemedStyle } from '../../../../theme';
import { TextStyle, ViewStyle } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

export const modalOverlay: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: moderateScale(spacing.md),
});

export const modalContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surface,
  borderRadius: moderateScale(16),
  width: '100%',
  maxWidth: moderateScale(500),
  maxHeight: '80%',
  shadowColor: colors.shadow,
  shadowOffset: {
    width: 0,
    height: moderateScale(4),
  },
  shadowOpacity: 0.3,
  shadowRadius: moderateScale(8),
  elevation: 8,
});

export const modalHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: moderateScale(spacing.md),
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(0, 0, 0, 0.1)',
});

export const modalTitle: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.xl),
  fontWeight: 'bold',
  color: colors.onSurface,
});

export const closeButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: moderateScale(spacing.xxs),
});

export const modalContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: moderateScale(spacing.md),
});

export const textInput: ThemedStyle<ViewStyle> = ({
  colors,
  spacing,
  fontSizes,
}) => ({
  backgroundColor: colors.surfaceVariant,
  borderRadius: moderateScale(8),
  padding: moderateScale(spacing.md),
  minHeight: verticalScale(150),
  maxHeight: verticalScale(300),
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurface,
  textAlignVertical: 'top',
  borderWidth: 1,
  borderColor: colors.outline,
});

export const modalFooter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: moderateScale(spacing.sm),
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: moderateScale(spacing.md),
  borderTopWidth: 1,
  borderTopColor: 'rgba(0, 0, 0, 0.1)',
});

export const cancelButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingVertical: moderateScale(spacing.sm),
  paddingHorizontal: moderateScale(spacing.lg),
  borderRadius: moderateScale(8),
  backgroundColor: colors.surfaceVariant,
});

export const cancelButtonText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '600',
  color: colors.onSurfaceVariant,
});

export const saveButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingVertical: moderateScale(spacing.sm),
  paddingHorizontal: moderateScale(spacing.lg),
  borderRadius: moderateScale(8),
  backgroundColor: colors.primary,
});

export const saveButtonText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '600',
  color: colors.onPrimary,
});

export const saveButtonDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surfaceVariant,
  opacity: 0.5,
});

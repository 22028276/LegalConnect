import { moderateScale } from 'react-native-size-matters';
import { TextStyle, ViewStyle } from 'react-native';
import { ThemedStyle } from '../../../../theme';

export const container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
});

export const scrollView: ThemedStyle<ViewStyle> = ({}) => ({
  flex: 1,
});

export const scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: moderateScale(spacing.md),
  paddingBottom: moderateScale(spacing.xl),
  paddingTop: moderateScale(spacing.md),
});

export const statusBadge: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignSelf: 'flex-start',
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: moderateScale(spacing.xs),
  borderRadius: moderateScale(20),
  marginBottom: moderateScale(spacing.md),
});

export const statusText: ThemedStyle<TextStyle> = ({ fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  fontWeight: '600' as const,
});

export const caseTitle: ThemedStyle<TextStyle> = ({
  fontSizes,
  spacing,
  colors,
}) => ({
  fontSize: moderateScale(fontSizes.xxl),
  fontWeight: 'bold' as const,
  color: colors.onSurface,
  marginBottom: moderateScale(spacing.lg),
  lineHeight: moderateScale(32),
});

export const section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: moderateScale(spacing.xl),
});

export const sectionTitle: ThemedStyle<TextStyle> = ({
  fontSizes,
  spacing,
  colors,
}) => ({
  fontSize: moderateScale(fontSizes.lg),
  fontWeight: 'bold' as const,
  color: colors.onSurface,
  marginBottom: moderateScale(spacing.md),
});

export const descriptionText: ThemedStyle<TextStyle> = ({
  fontSizes,
  colors,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurface,
  lineHeight: moderateScale(22),
});

export const infoRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  marginBottom: moderateScale(spacing.md),
  paddingVertical: moderateScale(spacing.xs),
});

export const infoTextContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginLeft: moderateScale(spacing.sm),
});

export const infoLabel: ThemedStyle<TextStyle> = ({ fontSizes, colors }) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurfaceVariant,
  marginBottom: moderateScale(2),
});

export const infoValue: ThemedStyle<TextStyle> = ({ fontSizes, colors }) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurface,
  fontWeight: '500' as const,
});

export const noteContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.surfaceVariant,
  borderRadius: moderateScale(8),
  padding: moderateScale(spacing.md),
  borderLeftWidth: 3,
  borderLeftColor: colors.primary,
});

export const noteText: ThemedStyle<TextStyle> = ({ fontSizes, colors }) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurface,
  lineHeight: moderateScale(22),
});

export const attachmentItem: ThemedStyle<ViewStyle> = ({
  spacing,
  colors,
}) => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  backgroundColor: colors.surface,
  borderRadius: moderateScale(8),
  padding: moderateScale(spacing.md),
  marginBottom: moderateScale(spacing.sm),
  borderWidth: 1,
  borderColor: colors.outline,
});

export const attachmentText: ThemedStyle<TextStyle> = ({
  fontSizes,
  colors,
  spacing,
}) => ({
  flex: 1,
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurface,
  marginLeft: moderateScale(spacing.sm),
});

export const buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: moderateScale(spacing.lg),
  gap: moderateScale(spacing.md),
});

export const primaryButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.primary,
  borderRadius: moderateScale(8),
  paddingVertical: moderateScale(spacing.md),
  paddingHorizontal: moderateScale(spacing.lg),
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: moderateScale(spacing.sm),
});

export const primaryButtonText: ThemedStyle<TextStyle> = ({
  fontSizes,
  colors,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '600' as const,
  color: colors.onPrimary,
});

export const secondaryButton: ThemedStyle<ViewStyle> = ({
  spacing,
  colors,
}) => ({
  backgroundColor: 'transparent',
  borderRadius: moderateScale(8),
  paddingVertical: moderateScale(spacing.md),
  paddingHorizontal: moderateScale(spacing.lg),
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: moderateScale(spacing.sm),
  borderWidth: 1,
  borderColor: colors.primary,
});

export const secondaryButtonText: ThemedStyle<TextStyle> = ({
  fontSizes,
  colors,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '600' as const,
  color: colors.primary,
});

export const loadingContainer: ThemedStyle<ViewStyle> = ({}) => ({
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
});

export const headerActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row' as const,
  gap: moderateScale(spacing.sm),
});

export const completeButton: ThemedStyle<ViewStyle> = ({
  spacing,
  colors,
}) => ({
  backgroundColor: colors.processStatus?.approved?.badgeColor || '#4CAF50',
  borderRadius: moderateScale(8),
  paddingVertical: moderateScale(spacing.md),
  paddingHorizontal: moderateScale(spacing.lg),
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: moderateScale(spacing.sm),
});

export const completeButtonText: ThemedStyle<TextStyle> = ({
  fontSizes,
  colors,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '600' as const,
  color: colors.onPrimary,
});

export const cancelButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: 'transparent',
  borderRadius: moderateScale(8),
  paddingVertical: moderateScale(spacing.md),
  paddingHorizontal: moderateScale(spacing.lg),
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: moderateScale(spacing.sm),
  borderWidth: 1,
  borderColor: colors.error,
});

export const cancelButtonText: ThemedStyle<TextStyle> = ({
  fontSizes,
  colors,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '600' as const,
  color: colors.error,
});

export const buttonDisabled: ThemedStyle<ViewStyle> = ({}) => ({
  opacity: 0.6,
});

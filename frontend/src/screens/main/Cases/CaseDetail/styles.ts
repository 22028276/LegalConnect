import { moderateScale } from 'react-native-size-matters';
import { TextStyle, ViewStyle } from 'react-native';

export const container = (theme: any): ViewStyle => ({
  flex: 1,
  backgroundColor: theme.colors.background,
});

export const scrollView = (_theme: any): ViewStyle => ({
  flex: 1,
});

export const scrollContent = (theme: any): ViewStyle => ({
  paddingHorizontal: moderateScale(theme.spacing.md),
  paddingBottom: moderateScale(theme.spacing.xl),
  paddingTop: moderateScale(theme.spacing.md),
});

export const statusBadge = (theme: any): ViewStyle => ({
  alignSelf: 'flex-start',
  paddingHorizontal: moderateScale(theme.spacing.md),
  paddingVertical: moderateScale(theme.spacing.xs),
  borderRadius: moderateScale(20),
  marginBottom: moderateScale(theme.spacing.md),
});

export const statusText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.sm),
  fontWeight: '600' as const,
});

export const caseTitle = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.xxl),
  fontWeight: 'bold' as const,
  color: theme.colors.onSurface,
  marginBottom: moderateScale(theme.spacing.lg),
  lineHeight: moderateScale(32),
});

export const section = (theme: any): ViewStyle => ({
  marginBottom: moderateScale(theme.spacing.xl),
});

export const sectionTitle = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.lg),
  fontWeight: 'bold' as const,
  color: theme.colors.onSurface,
  marginBottom: moderateScale(theme.spacing.md),
});

export const descriptionText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  color: theme.colors.onSurface,
  lineHeight: moderateScale(22),
});

export const infoRow = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  marginBottom: moderateScale(theme.spacing.md),
  paddingVertical: moderateScale(theme.spacing.xs),
});

export const infoTextContainer = (theme: any): ViewStyle => ({
  flex: 1,
  marginLeft: moderateScale(theme.spacing.sm),
});

export const infoLabel = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.sm),
  color: theme.colors.onSurfaceVariant,
  marginBottom: moderateScale(2),
});

export const infoValue = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  color: theme.colors.onSurface,
  fontWeight: '500' as const,
});

export const noteContainer = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.surfaceVariant,
  borderRadius: moderateScale(8),
  padding: moderateScale(theme.spacing.md),
  borderLeftWidth: 3,
  borderLeftColor: theme.colors.primary,
});

export const noteText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  color: theme.colors.onSurface,
  lineHeight: moderateScale(22),
});

export const attachmentItem = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  backgroundColor: theme.colors.surface,
  borderRadius: moderateScale(8),
  padding: moderateScale(theme.spacing.md),
  marginBottom: moderateScale(theme.spacing.sm),
  borderWidth: 1,
  borderColor: theme.colors.outline,
});

export const attachmentText = (theme: any): TextStyle => ({
  flex: 1,
  fontSize: moderateScale(theme.fontSizes.md),
  color: theme.colors.onSurface,
  marginLeft: moderateScale(theme.spacing.sm),
});

export const buttonContainer = (theme: any): ViewStyle => ({
  marginTop: moderateScale(theme.spacing.lg),
  gap: moderateScale(theme.spacing.md),
});

export const primaryButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.primary,
  borderRadius: moderateScale(8),
  paddingVertical: moderateScale(theme.spacing.md),
  paddingHorizontal: moderateScale(theme.spacing.lg),
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: moderateScale(theme.spacing.sm),
});

export const primaryButtonText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  fontWeight: '600' as const,
  color: theme.colors.onPrimary,
});

export const secondaryButton = (theme: any): ViewStyle => ({
  backgroundColor: 'transparent',
  borderRadius: moderateScale(8),
  paddingVertical: moderateScale(theme.spacing.md),
  paddingHorizontal: moderateScale(theme.spacing.lg),
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: moderateScale(theme.spacing.sm),
  borderWidth: 1,
  borderColor: theme.colors.primary,
});

export const secondaryButtonText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  fontWeight: '600' as const,
  color: theme.colors.primary,
});

export const loadingContainer = (_theme: any): ViewStyle => ({
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
});

export const headerActions = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  gap: moderateScale(theme.spacing.sm),
});

export const completeButton = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.processStatus?.approved || '#4CAF50',
  borderRadius: moderateScale(8),
  paddingVertical: moderateScale(theme.spacing.md),
  paddingHorizontal: moderateScale(theme.spacing.lg),
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: moderateScale(theme.spacing.sm),
});

export const completeButtonText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  fontWeight: '600' as const,
  color: theme.colors.onPrimary,
});

export const cancelButton = (theme: any): ViewStyle => ({
  backgroundColor: 'transparent',
  borderRadius: moderateScale(8),
  paddingVertical: moderateScale(theme.spacing.md),
  paddingHorizontal: moderateScale(theme.spacing.lg),
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  gap: moderateScale(theme.spacing.sm),
  borderWidth: 1,
  borderColor: theme.colors.error,
});

export const cancelButtonText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  fontWeight: '600' as const,
});

export const buttonDisabled = (theme: any): ViewStyle => ({
  opacity: 0.6,
});
import { moderateScale } from 'react-native-size-matters';
import { TextStyle, ViewStyle } from 'react-native';

export const container = (theme: any): ViewStyle => ({
  flex: 1,
  backgroundColor: theme.colors.background,
});

export const content = (theme: any): ViewStyle => ({
  flex: 1,
  paddingHorizontal: moderateScale(theme.spacing.md),
});

export const loadingContainer = (theme: any): ViewStyle => ({
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  gap: moderateScale(theme.spacing.md),
});

export const loadingText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  color: theme.colors.onSurfaceVariant,
});

export const headerInfo = (theme: any): ViewStyle => ({
  paddingVertical: moderateScale(theme.spacing.md),
});

export const headerTitle = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.xl),
  fontWeight: 'bold' as const,
  color: theme.colors.onSurface,
  marginBottom: moderateScale(theme.spacing.xs),
});

export const headerSubtitle = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.sm),
  color: theme.colors.onSurfaceVariant,
});

export const listContainer = (theme: any): ViewStyle => ({
  paddingBottom: moderateScale(theme.spacing.xl),
});

export const scheduleCard = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.surface,
  borderRadius: moderateScale(12),
  padding: moderateScale(theme.spacing.md),
  marginBottom: moderateScale(theme.spacing.md),
  borderWidth: 1,
  borderColor: theme.colors.outline,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
});

export const scheduleHeader = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  marginBottom: moderateScale(theme.spacing.md),
});

export const dateContainer = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: moderateScale(theme.spacing.xs),
});

export const dateText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  fontWeight: '600' as const,
  color: theme.colors.onSurface,
});

export const statusBadge = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.processStatus?.approved?.badgeColor || theme.colors.primaryContainer,
  paddingHorizontal: moderateScale(theme.spacing.sm),
  paddingVertical: moderateScale(theme.spacing.xs),
  borderRadius: moderateScale(12),
});

export const statusBadgeBooked = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.errorContainer,
});

export const statusBadgePast = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.surfaceVariant,
});

export const statusText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.xs),
  fontWeight: '600' as const,
  color: theme.colors.processStatus?.approved?.textColor || theme.colors.primary,
});

export const statusTextBooked = (theme: any): TextStyle => ({
  color: theme.colors.error,
});

export const timeRow = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  marginBottom: moderateScale(theme.spacing.sm),
  paddingVertical: moderateScale(theme.spacing.xs),
});

export const timeContainer = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: moderateScale(theme.spacing.xs),
  flex: 1,
});

export const timeLabel = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.sm),
  color: theme.colors.onSurfaceVariant,
});

export const timeValue = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.sm),
  fontWeight: '600' as const,
  color: theme.colors.onSurface,
});

export const durationContainer = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: moderateScale(theme.spacing.xs),
  paddingVertical: moderateScale(theme.spacing.xs),
  marginBottom: moderateScale(theme.spacing.sm),
});

export const durationText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.sm),
  color: theme.colors.onSurfaceVariant,
});

export const actionButtons = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  gap: moderateScale(theme.spacing.sm),
  marginTop: moderateScale(theme.spacing.xs),
});

export const actionButton = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: moderateScale(theme.spacing.xxs),
  paddingHorizontal: moderateScale(theme.spacing.sm),
  paddingVertical: moderateScale(theme.spacing.xs),
  borderRadius: moderateScale(8),
  borderWidth: 1,
  borderColor: theme.colors.outline,
});

export const editButton = (theme: any): ViewStyle => ({
  borderColor: theme.colors.primary,
});

export const deleteButton = (theme: any): ViewStyle => ({
  borderColor: theme.colors.error,
});

export const actionButtonText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.sm),
  color: theme.colors.primary,
});

export const emptyContainer = (theme: any): ViewStyle => ({
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  paddingHorizontal: moderateScale(theme.spacing.xl),
  paddingVertical: moderateScale(theme.spacing.xxl),
});

export const emptyTitle = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.xl),
  fontWeight: 'bold' as const,
  color: theme.colors.onSurface,
  marginTop: moderateScale(theme.spacing.md),
  marginBottom: moderateScale(theme.spacing.sm),
});

export const emptyMessage = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  color: theme.colors.onSurfaceVariant,
  textAlign: 'center' as const,
  lineHeight: moderateScale(22),
  marginBottom: moderateScale(24),
});

export const emptyAddButton = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  backgroundColor: theme.colors.primary,
  paddingVertical: moderateScale(theme.spacing.md),
  paddingHorizontal: moderateScale(theme.spacing.lg),
  borderRadius: moderateScale(12),
  gap: moderateScale(theme.spacing.xs),
});

export const emptyAddButtonText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  fontWeight: '600' as const,
  color: theme.colors.onPrimary,
});

export const modalOverlay = (theme: any): ViewStyle => ({
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-end' as const,
});

export const modalContent = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.surface,
  borderTopLeftRadius: moderateScale(20),
  borderTopRightRadius: moderateScale(20),
  padding: moderateScale(theme.spacing.lg),
  maxHeight: '80%',
});

export const modalHeader = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  marginBottom: moderateScale(theme.spacing.md),
});

export const modalTitle = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.xl),
  fontWeight: '600' as const,
  color: theme.colors.onSurface,
});

export const modalBody = (theme: any): ViewStyle => ({
  gap: moderateScale(theme.spacing.md),
  paddingBottom: moderateScale(theme.spacing.md),
});

export const timePickerContainer = (theme: any): ViewStyle => ({
  gap: moderateScale(theme.spacing.xs),
  marginBottom: moderateScale(theme.spacing.md),
});

export const timePickerLabel = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  fontWeight: '500' as const,
  color: theme.colors.onSurface,
});

export const inputWrapper = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: moderateScale(theme.spacing.sm),
  padding: moderateScale(theme.spacing.md),
  borderRadius: moderateScale(8),
  borderWidth: 1,
  borderColor: theme.colors.outline,
  backgroundColor: theme.colors.surfaceContainerHighest,
});

export const textInput = (theme: any): TextStyle => ({
  flex: 1,
  fontSize: moderateScale(theme.fontSizes.md),
  color: theme.colors.onSurface,
  paddingVertical: 0,
});

export const inputHint = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.xs),
  color: theme.colors.onSurfaceVariant,
  marginTop: moderateScale(theme.spacing.xxs),
  fontStyle: 'italic' as const,
});

export const buttonRow = (theme: any): ViewStyle => ({
  flexDirection: 'row' as const,
  gap: moderateScale(theme.spacing.sm),
  marginTop: moderateScale(theme.spacing.md),
});

export const cancelButton = (theme: any): ViewStyle => ({
  flex: 1,
  backgroundColor: theme.colors.surfaceVariant,
  padding: moderateScale(theme.spacing.md),
  borderRadius: moderateScale(8),
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
});

export const cancelButtonText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  fontWeight: '600' as const,
  color: theme.colors.onSurfaceVariant,
});

export const submitButton = (theme: any): ViewStyle => ({
  flex: 1,
  backgroundColor: theme.colors.primary,
  padding: moderateScale(theme.spacing.md),
  borderRadius: moderateScale(8),
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
});

export const submitButtonDisabled = (theme: any): ViewStyle => ({
  opacity: 0.6,
});

export const submitButtonText = (theme: any): TextStyle => ({
  fontSize: moderateScale(theme.fontSizes.md),
  fontWeight: '600' as const,
  color: theme.colors.onPrimary,
});

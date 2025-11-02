import { ThemedStyle } from '../../../../theme';
import { TextStyle, ViewStyle } from 'react-native';
import { scale, moderateScale } from 'react-native-size-matters';

export const container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
});

export const listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: scale(spacing.md),
});

export const emptyListContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

export const requestCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderRadius: scale(spacing.sm),
  padding: scale(spacing.md),
  marginBottom: scale(spacing.md),
  borderWidth: 1,
  borderColor: colors.outline,
});

export const cardHeader: ThemedStyle<ViewStyle> = () => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: scale(8),
});

export const userInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

export const userName: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.lg),
  fontWeight: '600',
  color: colors.onSurface,
  marginBottom: scale(4),
});

export const userEmail: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurfaceVariant,
});

export const statusBadge: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: scale(spacing.sm),
  paddingVertical: scale(spacing.xs),
  borderRadius: scale(spacing.xs),
  alignSelf: 'flex-start',
});

export const statusText: ThemedStyle<TextStyle> = ({ fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  fontWeight: '600',
});

export const cardBody: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: scale(spacing.sm),
});

export const infoRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: scale(spacing.xs),
});

export const infoLabel: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurfaceVariant,
  fontWeight: '600',
  marginLeft: scale(8),
  flex: 1,
});

export const infoValue: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurface,
});

export const actionRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  marginTop: scale(spacing.md),
  gap: scale(spacing.sm),
});

export const actionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: scale(spacing.sm),
  borderRadius: scale(spacing.sm),
  gap: scale(spacing.xs),
});

export const approveButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.primary,
});

export const rejectButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
});

export const buttonText: ThemedStyle<TextStyle> = ({ fontSizes }) => ({
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '600',
  color: '#FFFFFF',
});

export const emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: scale(spacing.xl),
});

export const emptyText: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.lg),
  color: colors.onSurfaceVariant,
  textAlign: 'center',
  marginTop: scale(16),
});

export const filterContainer: ThemedStyle<ViewStyle> = ({
  spacing,
  colors,
}) => ({
  flexDirection: 'row',
  paddingHorizontal: scale(spacing.md),
  paddingVertical: scale(spacing.sm),
  backgroundColor: colors.surface,
  borderBottomWidth: 1,
  borderBottomColor: colors.outline,
  gap: scale(spacing.sm),
});

export const filterButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: scale(spacing.md),
  paddingVertical: scale(spacing.xs),
  borderRadius: scale(spacing.sm),
  borderWidth: 1,
});

export const filterButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.primary,
  borderColor: colors.primary,
});

export const filterButtonInactive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: 'transparent',
  borderColor: colors.outline,
});

export const filterButtonText: ThemedStyle<TextStyle> = ({ fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  fontWeight: '600',
});

export const filterButtonTextActive: ThemedStyle<TextStyle> = () => ({
  color: '#FFFFFF',
});

export const filterButtonTextInactive: ThemedStyle<TextStyle> = ({
  colors,
}) => ({
  color: colors.onSurfaceVariant,
});

export const cardFooter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginTop: scale(spacing.sm),
  paddingTop: scale(spacing.sm),
  borderTopWidth: 1,
  borderTopColor: 'rgba(0,0,0,0.05)',
});

export const tapToViewText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.primary,
  fontWeight: '600',
  marginRight: scale(spacing.xs),
});

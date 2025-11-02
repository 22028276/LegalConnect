import { ThemedStyle } from '../../../../theme';
import { TextStyle, ViewStyle } from 'react-native';
import { scale, moderateScale } from 'react-native-size-matters';

export const container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
});

export const scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: scale(spacing.md),
});

export const statusContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: 'center',
  marginBottom: scale(spacing.lg),
});

export const statusBadge: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: scale(spacing.md),
  paddingVertical: scale(spacing.sm),
  borderRadius: scale(spacing.sm),
  marginBottom: scale(spacing.sm),
});

export const statusDate: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurfaceVariant,
});

export const section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.surface,
  borderRadius: scale(spacing.sm),
  padding: scale(spacing.md),
  marginBottom: scale(spacing.md),
  borderWidth: 1,
  borderColor: colors.outline,
});

export const sectionTitle: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.lg),
  fontWeight: '700',
  color: colors.onSurface,
  marginBottom: scale(spacing.md),
});

export const infoRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  marginBottom: scale(spacing.sm),
  alignItems: 'flex-start',
});

export const infoLabel: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurfaceVariant,
  fontWeight: '600',
  flex: 1,
  marginLeft: scale(spacing.xs),
});

export const infoValue: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurface,
  flex: 2,
});

export const rejectionSection: ThemedStyle<ViewStyle> = ({
  colors,
  spacing,
}) => ({
  backgroundColor: colors.errorContainer,
  borderRadius: scale(spacing.sm),
  padding: scale(spacing.md),
  marginBottom: scale(spacing.md),
  borderWidth: 1,
  borderColor: colors.error,
});

export const rejectionTitle: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '700',
  color: colors.error,
  marginBottom: scale(spacing.xs),
});

export const rejectionText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onErrorContainer,
  lineHeight: moderateScale(fontSizes.md) * 1.5,
});

export const actionContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: scale(spacing.md),
  gap: scale(spacing.sm),
});

export const actionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: scale(spacing.md),
  borderRadius: scale(spacing.sm),
  gap: scale(spacing.sm),
});

export const approveButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.primary,
});

export const rejectButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
});

export const buttonText: ThemedStyle<TextStyle> = ({ fontSizes, colors }) => ({
  fontSize: moderateScale(fontSizes.lg),
  fontWeight: '700',
  color: colors.inverseOnSurface,
});

export const loadingContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const divider: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 1,
  backgroundColor: colors.outline,
  marginVertical: scale(spacing.sm),
});

export const iconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: scale(spacing.xs),
});

export const imageGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: scale(spacing.sm),
});

export const imageRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: scale(spacing.md),
});

export const imageContainer: ThemedStyle<ViewStyle> = () => ({
  width: '48%',
});

export const imageCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: '100%',
  aspectRatio: 1.5,
  borderRadius: scale(spacing.sm),
  overflow: 'hidden',
  backgroundColor: colors.surfaceVariant,
  borderWidth: 1,
  borderColor: colors.outline,
});

export const imageLabel: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.sm),
  fontWeight: '600',
  color: colors.onSurface,
  marginBottom: scale(spacing.xs),
});

export const image: ThemedStyle<any> = () => ({
  width: '100%',
  height: '100%',
});

export const imagePlaceholder: ThemedStyle<ViewStyle> = () => ({
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
});

export const imagePlaceholderText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.xs),
  color: colors.onSurfaceVariant,
  marginTop: scale(4),
});

export const pdfPreview: ThemedStyle<ViewStyle> = () => ({
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  gap: scale(8),
});

export const pdfLabel: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.primary,
  fontWeight: '600',
});

export const modalOverlay: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  justifyContent: 'center',
  alignItems: 'center',
});

export const modalContent: ThemedStyle<ViewStyle> = () => ({
  width: '90%',
  height: '80%',
  justifyContent: 'center',
  alignItems: 'center',
});

export const fullImage: ThemedStyle<any> = () => ({
  width: '100%',
  height: '100%',
});

export const closeButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: 'absolute',
  top: scale(spacing.xl),
  right: scale(spacing.xl),
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  borderRadius: scale(spacing.lg),
  padding: scale(spacing.sm),
});

export const imageTitle: ThemedStyle<TextStyle> = ({
  fontSizes,
  spacing,
  colors,
}) => ({
  position: 'absolute',
  top: scale(spacing.xl),
  left: scale(spacing.xl),
  color: colors.inverseOnSurface,
  fontSize: moderateScale(fontSizes.lg),
  fontWeight: '700',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  paddingHorizontal: scale(spacing.md),
  paddingVertical: scale(spacing.sm),
  borderRadius: scale(spacing.sm),
});

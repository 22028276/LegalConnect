import { moderateScale, verticalScale } from 'react-native-size-matters';
import { ThemedStyle } from '../../../theme';

export const container: ThemedStyle<any> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
});

export const header: ThemedStyle<any> = ({ spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: verticalScale(spacing.lg),
  backgroundColor: '#1a1a2e',
});

export const headerTitle: ThemedStyle<any> = ({ fontSizes }) => ({
  fontSize: moderateScale(fontSizes.xl),
  fontWeight: 'bold',
  color: '#FFFFFF',
});

export const searchButton: ThemedStyle<any> = ({ spacing }) => ({
  padding: moderateScale(spacing.xs),
});

export const searchContainer: ThemedStyle<any> = ({ spacing }) => ({
  paddingHorizontal: moderateScale(spacing.md),
  paddingTop: verticalScale(spacing.sm),
  paddingBottom: verticalScale(spacing.xs),
});

export const searchInputContainer: ThemedStyle<any> = () => ({
  width: '100%',
});

export const searchInputWrapper: ThemedStyle<any> = () => ({
  marginBottom: 0,
});

export const filterContainer: ThemedStyle<any> = ({ spacing }) => ({
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: verticalScale(spacing.sm),
});

export const filterButton: ThemedStyle<any> = ({ spacing }) => ({
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: verticalScale(spacing.xs),
  borderRadius: moderateScale(20),
  backgroundColor: '#F5F5F5',
  borderWidth: 1,
  borderColor: '#E0E0E0',
});

export const filterButtonActive: ThemedStyle<any> = () => ({
  backgroundColor: '#1a1a2e',
  borderColor: '#1a1a2e',
});

export const filterButtonText: ThemedStyle<any> = ({ fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  fontWeight: '500',
  color: '#666666',
});

export const filterButtonTextActive: ThemedStyle<any> = () => ({
  color: '#FFFFFF',
});

export const addButton: ThemedStyle<any> = ({ spacing }) => ({
  padding: moderateScale(spacing.xs),
  backgroundColor: '#F5F5F5',
  borderRadius: moderateScale(20),
  borderWidth: 1,
  borderColor: '#E0E0E0',
});

export const scrollView: ThemedStyle<any> = () => ({
  flex: 1,
});

export const scrollContent: ThemedStyle<any> = ({ spacing }) => ({
  padding: moderateScale(spacing.md),
  paddingBottom: verticalScale(spacing.xxxxxxxl),
});

export const documentSection: ThemedStyle<any> = ({ spacing }) => ({
  marginBottom: verticalScale(spacing.xl),
});

export const sectionTitle: ThemedStyle<any> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.lg),
  fontWeight: 'bold',
  color: colors.onBackground,
  marginBottom: verticalScale(spacing.sm),
});

export const documentCard: ThemedStyle<any> = ({ colors, spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.surface,
  borderRadius: moderateScale(12),
  padding: moderateScale(spacing.md),
  borderWidth: 1,
  borderColor: '#E8E8E8',
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: moderateScale(12),
  elevation: 2,
});

export const documentIconContainer: ThemedStyle<any> = ({ spacing }) => ({
  marginRight: moderateScale(spacing.md),
  padding: moderateScale(spacing.xs),
});

export const documentInfo: ThemedStyle<any> = () => ({
  flex: 1,
});

export const documentName: ThemedStyle<any> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '700',
  color: colors.onSurface,
  marginBottom: moderateScale(4),
});

export const documentTime: ThemedStyle<any> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.onSurfaceVariant,
});

export const emptyContainer: ThemedStyle<any> = ({ spacing }) => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: verticalScale(spacing.xxl),
});

export const emptyText: ThemedStyle<any> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurfaceVariant,
  textAlign: 'center',
});

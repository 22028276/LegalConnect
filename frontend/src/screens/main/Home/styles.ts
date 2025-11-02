import {
  ImageStyle,
  moderateScale,
  verticalScale,
} from 'react-native-size-matters';
import { ThemedStyle } from '../../../theme';

export const container: ThemedStyle<any> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
});

export const scrollView: ThemedStyle<any> = () => ({
  flex: 1,
});

export const scrollContent: ThemedStyle<any> = ({ spacing }) => ({
  paddingBottom: verticalScale(spacing.xxxxxl),
});

export const header: ThemedStyle<any> = ({ spacing }) => ({
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: verticalScale(spacing.lg),
  alignItems: 'center',
});

export const title: ThemedStyle<any> = ({ colors, spacing, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.lg),
  fontWeight: 'bold',
  color: colors.onBackground,
  marginBottom: verticalScale(spacing.xs),
});

export const subtitle: ThemedStyle<any> = ({ colors }) => ({
  fontSize: moderateScale(16),
  color: colors.onSurfaceVariant,
  textAlign: 'center',
});

export const listContainer: ThemedStyle<any> = ({ spacing }) => ({
  paddingHorizontal: moderateScale(spacing.sm),
  paddingBottom: verticalScale(spacing.xl),
});

export const sectionHeader: ThemedStyle<any> = ({ spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: verticalScale(spacing.xxs),
  paddingHorizontal: moderateScale(spacing.sm),
});

export const sectionTitle: ThemedStyle<any> = ({ colors }) => ({
  fontSize: moderateScale(20),
  fontWeight: '600',
  color: colors.onBackground,
});

export const viewMoreText: ThemedStyle<any> = ({ colors }) => ({
  fontSize: moderateScale(14),
  color: colors.primary,
  fontWeight: '500',
});

export const filterContainer: ThemedStyle<any> = ({ spacing }) => ({
  flexDirection: 'row',
  paddingHorizontal: moderateScale(spacing.sm),
  marginBottom: verticalScale(spacing.xs),
  gap: moderateScale(spacing.xs),
});

export const row: ThemedStyle<any> = ({ spacing }) => ({
  justifyContent: 'space-between',
  paddingHorizontal: moderateScale(spacing.xxs),
  marginBottom: verticalScale(spacing.sm),
  gap: moderateScale(spacing.xxs),
});

export const flatListContent: ThemedStyle<any> = ({ spacing }) => ({
  paddingBottom: verticalScale(spacing.xl),
});

export const horizontalListContent: ThemedStyle<any> = ({ spacing }) => ({
  paddingHorizontal: moderateScale(spacing.sm),
  paddingBottom: verticalScale(spacing.md),
});

export const headerContainer: ThemedStyle<any> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: verticalScale(spacing.sm),
  gap: moderateScale(spacing.sm),
});

export const searchContainer: ThemedStyle<any> = () => ({
  flex: 1,
});

export const searchInputContainer: ThemedStyle<any> = () => ({
  marginBottom: 0,
});

export const searchInputWrapper: ThemedStyle<any> = ({ colors }) => ({
  backgroundColor: colors.surfaceContainerLowest,
  borderWidth: 1,
});

export const profileButton: ThemedStyle<any> = ({}) => ({
  width: moderateScale(44),
  height: moderateScale(44),
  borderRadius: moderateScale(22),
  justifyContent: 'center',
  alignItems: 'center',
});

export const profileImageContainer: ThemedStyle<any> = ({}) => ({
  width: moderateScale(44),
  height: moderateScale(44),
  borderRadius: moderateScale(22),
  overflow: 'hidden',
});

export const profileImage: ThemedStyle<ImageStyle> = ({}) => ({
  width: '100%',
  height: '100%',
});
export const noDataContainer: ThemedStyle<any> = ({ spacing }) => ({
  paddingTop: verticalScale(spacing.xl),
  paddingHorizontal: moderateScale(spacing.sm),
  paddingBottom: verticalScale(spacing.xl),
});

export const noDataText: ThemedStyle<any> = ({ colors }) => ({
  fontSize: moderateScale(16),
  color: colors.onSurfaceVariant,
  textAlign: 'center',
});

import { ThemedStyle } from '../../../theme';
import { ViewStyle, TextStyle } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

export const container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
});

export const searchContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: moderateScale(spacing.md),
  paddingTop: verticalScale(spacing.sm),
  paddingBottom: verticalScale(spacing.xs),
});

export const searchInputContainer: ThemedStyle<ViewStyle> = () => ({
  width: '100%',
});

export const searchInputWrapper: ThemedStyle<ViewStyle> = () => ({
  marginBottom: 0,
});

export const filterContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: verticalScale(spacing.sm),
});

export const listContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: moderateScale(spacing.sm),
  paddingBottom: verticalScale(spacing.lg),
});

export const row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  justifyContent: 'space-between',
  marginBottom: verticalScale(spacing.md),
  gap: moderateScale(spacing.sm),
});

export const cardWrapper: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

export const emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: verticalScale(spacing.xxl),
});

export const emptyText: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurfaceVariant,
  textAlign: 'center',
});

export const loadingContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

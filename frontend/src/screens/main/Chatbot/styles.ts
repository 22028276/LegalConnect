import { ThemedStyle } from '../../../theme';
import { TextStyle, ViewStyle } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export const container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
});

export const chatContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

export const messagesList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: moderateScale(spacing.md),
  paddingBottom: verticalScale(spacing.sm),
});

export const messageContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: verticalScale(spacing.md),
  maxWidth: '85%',
});

export const userMessage: ThemedStyle<ViewStyle> = () => ({
  alignSelf: 'flex-end',
});

export const botMessage: ThemedStyle<ViewStyle> = () => ({
  alignSelf: 'flex-start',
});

export const messageBubble: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: moderateScale(spacing.sm),
  borderRadius: moderateScale(18),
});

export const userBubble: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.primary,
  borderBottomRightRadius: moderateScale(4),
});

export const botBubble: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surfaceVariant,
  borderBottomLeftRadius: moderateScale(4),
});

export const messageText: ThemedStyle<TextStyle> = ({ fontSizes }) => ({
  fontSize: moderateScale(fontSizes.md),
  lineHeight: moderateScale(20),
});

export const userMessageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.onPrimary,
});

export const botMessageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.onSurface,
});

export const messageTime: ThemedStyle<TextStyle> = ({
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.xs),
  marginTop: moderateScale(spacing.xxs),
});

export const userMessageTime: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.onPrimary,
  opacity: 0.8,
  textAlign: 'right',
});

export const botMessageTime: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.onSurfaceVariant,
});

export const suggestionsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: verticalScale(spacing.sm),
  gap: moderateScale(spacing.xs),
});

export const suggestionChip: ThemedStyle<ViewStyle> = ({
  colors,
  spacing,
}) => ({
  backgroundColor: colors.surfaceContainerHigh,
  paddingHorizontal: moderateScale(spacing.sm),
  paddingVertical: moderateScale(spacing.xs),
  borderRadius: moderateScale(12),
  borderWidth: 1,
  borderColor: colors.outline,
});

export const suggestionText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
}) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.primary,
  fontWeight: '500',
});

export const linksContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: verticalScale(spacing.xs),
  gap: moderateScale(spacing.xxs),
});

export const linkText: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.sm),
  color: colors.primary,
  textDecorationLine: 'underline',
});

export const confidenceBadge: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: verticalScale(spacing.xs),
  paddingHorizontal: moderateScale(spacing.xs),
  paddingVertical: moderateScale(2),
  borderRadius: moderateScale(8),
  alignSelf: 'flex-start',
});

export const confidenceText: ThemedStyle<TextStyle> = ({ fontSizes }) => ({
  fontSize: moderateScale(fontSizes.xs),
  fontWeight: '600',
});

export const inputContainer: ThemedStyle<ViewStyle> = ({
  colors,
  spacing,
}) => ({
  backgroundColor: colors.surface,
  borderTopWidth: 1,
  borderTopColor: colors.outlineVariant,
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: moderateScale(spacing.sm),
});

export const inputRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: moderateScale(spacing.sm),
});

export const textInputContainer: ThemedStyle<ViewStyle> = ({
  colors,
  spacing,
}) => ({
  flex: 1,
  backgroundColor: colors.surfaceVariant,
  borderRadius: moderateScale(20),
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: moderateScale(spacing.sm),
  minHeight: moderateScale(40),
  maxHeight: moderateScale(100),
});

export const textInput: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.md),
  color: colors.onSurface,
  padding: 0,
});

export const sendButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.primary,
  width: moderateScale(40),
  height: moderateScale(40),
  borderRadius: moderateScale(20),
  alignItems: 'center',
  justifyContent: 'center',
});

export const sendButtonDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surfaceVariant,
});

export const loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: moderateScale(spacing.xs),
  paddingVertical: moderateScale(spacing.sm),
});

export const loadingDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: scale(8),
  height: scale(8),
  borderRadius: scale(4),
  backgroundColor: colors.onSurfaceVariant,
});

export const emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: moderateScale(spacing.xl),
});

export const emptyText: ThemedStyle<TextStyle> = ({
  colors,
  fontSizes,
  spacing,
}) => ({
  fontSize: moderateScale(fontSizes.lg),
  color: colors.onSurfaceVariant,
  textAlign: 'center',
  marginTop: verticalScale(spacing.md),
});

export const headerContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const clearButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: moderateScale(spacing.xs),
});

export const clearButtonAbsolute: ThemedStyle<ViewStyle> = () => ({
  position: 'absolute',
  right: 16,
});

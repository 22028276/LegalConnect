import { ThemedStyle } from '../../../../theme';
import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export const container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
});

export const header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: moderateScale(spacing.sm),
  borderBottomWidth: 1,
  borderBottomColor: '#E8E8E8',
});

export const backButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: moderateScale(spacing.xs),
  marginRight: moderateScale(spacing.sm),
});

export const headerInfo: ThemedStyle<ViewStyle> = ({}) => ({
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
});

export const headerAvatar: ThemedStyle<ImageStyle> = () => ({
  width: scale(32),
  height: scale(32),
  borderRadius: scale(16),
  marginRight: moderateScale(8),
});

export const avatarPlaceholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: scale(32),
  height: scale(32),
  borderRadius: 100,
  backgroundColor: colors.surfaceVariant,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: moderateScale(8),
});

export const headerName: ThemedStyle<TextStyle> = ({ colors, fontSizes }) => ({
  fontSize: moderateScale(fontSizes.md),
  fontWeight: '600',
  color: colors.onSurface,
});

export const headerActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: moderateScale(spacing.sm),
});

export const actionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: moderateScale(spacing.xs),
});

export const chatContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

export const messagesList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: moderateScale(spacing.md),
  paddingBottom: verticalScale(spacing.sm),
});

export const messageContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  marginBottom: verticalScale(spacing.sm),
  alignItems: 'flex-end',
});

export const myMessage: ThemedStyle<ViewStyle> = () => ({
  justifyContent: 'flex-end',
});

export const otherMessage: ThemedStyle<ViewStyle> = () => ({
  justifyContent: 'flex-start',
});

export const messageAvatar: ThemedStyle<ImageStyle> = () => ({
  width: scale(24),
  height: scale(24),
  borderRadius: scale(12),
  marginRight: moderateScale(8),
});

export const messageBubble: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  maxWidth: '80%',
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: moderateScale(spacing.sm),
  borderRadius: moderateScale(18),
});

export const myBubble: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.primary,
  borderBottomRightRadius: moderateScale(4),
});

export const otherBubble: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.surfaceVariant,
  borderBottomLeftRadius: moderateScale(4),
});

export const messageText: ThemedStyle<TextStyle> = ({ fontSizes }) => ({
  fontSize: moderateScale(fontSizes.md),
  lineHeight: moderateScale(20),
});

export const myMessageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.onPrimary,
});

export const otherMessageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.onSurface,
});

export const messageTime: ThemedStyle<TextStyle> = ({ fontSizes }) => ({
  fontSize: moderateScale(fontSizes.xs),
  marginTop: moderateScale(4),
});

export const myMessageTime: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.onPrimary,
  opacity: 0.8,
});

export const otherMessageTime: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.onSurfaceVariant,
});

export const inputContainer: ThemedStyle<ViewStyle> = ({
  colors,
  spacing,
}) => ({
  backgroundColor: colors.surface,
  borderTopWidth: 1,
  borderTopColor: '#E8E8E8',
  paddingHorizontal: moderateScale(spacing.md),
  paddingVertical: moderateScale(spacing.sm),
});

export const inputRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: moderateScale(spacing.sm),
});

export const inputButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: moderateScale(spacing.xs),
});

export const textInputContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  backgroundColor: '#F2F2F7',
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

export const sendButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: moderateScale(spacing.xs),
});

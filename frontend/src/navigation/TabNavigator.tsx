/* eslint-disable react/no-unstable-nested-components */
import Icon from '@react-native-vector-icons/ionicons';
import FontAwesomeIcon from '@react-native-vector-icons/fontawesome';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { ThemedStyle } from '../theme';
import React from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Animated,
  Text,
} from 'react-native';
import { verticalScale, moderateScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeTabsNames, HomeTabsRoutes, StackScreenRoute } from './routes';
import { useAppTheme } from '../theme/theme.provider';
import { useTranslation } from 'react-i18next';

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      key={i18n.language}
      screenOptions={{ headerShown: false }}
      tabBar={(props: BottomTabBarProps) => (
        <CustomTabBar {...props} insets={insets} />
      )}
    >
      {HomeTabsRoutes.map((route: StackScreenRoute) => (
        <Tab.Screen
          key={route.name}
          name={route.name}
          component={route.component}
          options={{ headerShown: false }}
        />
      ))}
    </Tab.Navigator>
  );
}

function CustomTabBar(props: BottomTabBarProps & { insets: any }) {
  const { state, navigation, insets } = props;
  const { themed, theme } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={themed($tabBar(insets))}>
      {/* Nền và bo góc */}
      <Animated.View style={themed($tabBarBackground)} />

      {/* Đường kẻ mảnh dưới cùng (để huy hiệu nhìn nổi) */}
      <View style={themed($bottomHairline)} />

      {/* Huy hiệu nổi ở giữa - Chatbot button */}
      <View style={themed($centerBadgeWrapper)} pointerEvents="box-none">
        <TouchableOpacity
          style={themed($centerBadge)}
          onPress={() => {
            // Navigate to parent navigator (MainStack) then to Chatbot
            const parentNav = navigation.getParent();
            if (parentNav) {
              parentNav.navigate('Chatbot' as any);
            }
          }}
          activeOpacity={0.8}
        >
          <FontAwesomeIcon
            name="balance-scale"
            size={moderateScale(24)}
            color={theme.colors.onPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Hàng item */}
      <View style={themed($tabItemsRow)}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const color = isFocused
            ? theme.colors.primary
            : theme.colors.onBackground;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={getTabAccessibilityLabel(route.name, t)}
              onPress={onPress}
              style={themed($tabBarItem(isFocused))}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.8}
            >
              <AnimatedTabIcon
                route={{ name: route.name, component: () => null }}
                focused={isFocused}
                color={color}
                size={22}
              />
              <Text style={[themed($tabBarLabel), { color }]} numberOfLines={1}>
                {getTabLabel(route.name, t)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function AnimatedTabIcon({
  route,
  focused,
  color,
  size,
}: {
  route: StackScreenRoute;
  focused: boolean;
  color: string;
  size: number;
}) {
  const scaleValue = React.useRef(
    new Animated.Value(focused ? 1.08 : 1),
  ).current;
  const opacityValue = React.useRef(
    new Animated.Value(focused ? 1 : 0.8),
  ).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: focused ? 1.08 : 1,
        useNativeDriver: true,
        tension: 140,
        friction: 14,
      }),
      Animated.spring(opacityValue, {
        toValue: focused ? 1 : 0.8,
        useNativeDriver: true,
        tension: 140,
        friction: 14,
      }),
    ]).start();
  }, [focused, scaleValue, opacityValue]);

  let iconName: string = 'home-outline';

  if (route.name === HomeTabsNames.Home) {
    iconName = focused ? 'home' : 'home-outline';
  } else if (route.name === HomeTabsNames.Cases) {
    iconName = focused ? 'document-text' : 'document-text-outline';
  } else if (route.name === HomeTabsNames.Messages) {
    iconName = focused ? 'chatbubble' : 'chatbubble-outline';
  } else if (route.name === HomeTabsNames.Documents) {
    iconName = focused ? 'book' : 'book-outline';
  }

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleValue }], opacity: opacityValue }}
    >
      <Icon name={iconName as any} size={moderateScale(size)} color={color} />
    </Animated.View>
  );
}

function getTabLabel(routeName: string, t: any): string {
  switch (routeName) {
    case HomeTabsNames.Home:
      return t('tabs.home');
    case HomeTabsNames.Cases:
      return t('tabs.works');
    case HomeTabsNames.Messages:
      return t('tabs.messages');
    case HomeTabsNames.Documents:
      return t('tabs.documents');
    default:
      return routeName;
  }
}

function getTabAccessibilityLabel(routeName: string, t: any): string {
  switch (routeName) {
    case HomeTabsNames.Home:
      return t('tabs.navigateToHome');
    case HomeTabsNames.Cases:
      return t('tabs.navigateToWorks');
    case HomeTabsNames.Messages:
      return t('tabs.navigateToMessages');
    case HomeTabsNames.Documents:
      return t('tabs.navigateToDocuments');
    default:
      return `Navigate to ${routeName} screen`;
  }
}

const $tabBar =
  (insets: any): ThemedStyle<ViewStyle> =>
  ({ spacing }) => ({
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    // Cao hơn mặc định một chút để giống hình (nổi và thoáng)
    height: verticalScale(spacing.xxxxxl) + insets.bottom + verticalScale(2), // ~58 + safe area
    paddingBottom: insets.bottom,
    justifyContent: 'flex-end',
    alignItems: 'center',
  });

const $tabBarBackground: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  top: 0,
  backgroundColor: colors.surfaceContainerLowest || '#FFFFFF',
  borderTopLeftRadius: moderateScale(22),
  borderTopRightRadius: moderateScale(22),

  // Bóng đổ mềm phía trên giống iOS
  shadowColor: colors.shadow || '#000',
  shadowOffset: { width: 0, height: -8 },
  shadowOpacity: 0.12,
  shadowRadius: 20,
  elevation: 18,
});

const $bottomHairline: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: spacing.xxxxs,
  backgroundColor: colors.outlineVariant || 'rgba(0,0,0,0.06)',
});

const $tabBarLabel: ThemedStyle<TextStyle> = ({
  spacing,
  fontSizes,
  colors,
}) => ({
  fontSize: moderateScale(fontSizes.sm),
  fontWeight: '600',
  marginTop: verticalScale(spacing.xxxs), // 2px
  color: colors.onBackground,
  letterSpacing: 0.05,
});

const $tabBarItem =
  (focused: boolean): ThemedStyle<ViewStyle> =>
  ({ spacing }) => ({
    paddingVertical: verticalScale(spacing.xxxs),
    paddingHorizontal: moderateScale(spacing.xxxs),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(spacing.xxxxl), // ~48px
    minWidth: moderateScale(spacing.xxxl), // ~40px
    flex: 1,
    backgroundColor: 'transparent',
    // Nhẹ nhàng làm nổi icon khi active
    transform: [{ translateY: focused ? -1 : 0 }],
  });

const $tabItemsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  // Kéo hàng item lên một chút để khoảng cách với huy hiệu giống ảnh
  bottom: verticalScale(spacing.xs),
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
  paddingHorizontal: moderateScale(12),
});

const $centerBadgeWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: 'absolute',
  // Nổi hẳn lên khỏi mép trên thanh tab như hình
  top: -moderateScale(spacing.lg),
  left: 0,
  right: 0,
  alignItems: 'center',
  zIndex: 2,
});

const $centerBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: moderateScale(spacing.xxxxxl),
  height: moderateScale(spacing.xxxxxl),
  borderRadius: moderateScale(spacing.xxxxxl / 2),
  backgroundColor: colors.primary,
  alignItems: 'center',
  justifyContent: 'center',

  // Viền sáng (vòng trắng) như đĩa nổi
  borderWidth: spacing.xxs,
  borderColor: colors.surfaceContainerLowest as string,

  // Bóng đổ mềm
  shadowColor: '#000',
  shadowOpacity: 0.22,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 10,
});

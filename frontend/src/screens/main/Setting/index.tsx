import Header from '../../../components/layout/header';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import {
  getUserInfo,
  selectRole,
  selectUser,
  signOut,
} from '../../../stores/user.slice';
import Icon from '@react-native-vector-icons/ionicons'; // Or any other icon library
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  InteractionManager,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as styles from './styles';
import { useAppTheme } from '../../../theme/theme.provider';
import { MainStackNames } from '../../../navigation/routes';
import i18n from 'i18next';
import { t } from '../../../i18n';
import { store } from '../../../redux/store';

function TextChild({ text }: { text: string }) {
  const { themed, theme } = useAppTheme();
  return (
    <View style={themed(styles.rowValueContainer)}>
      <Text style={themed(styles.rowValue)}>{text}</Text>
      <Icon name="chevron-forward" size={20} color={theme.colors.outline} />
    </View>
  );
}

export default function SettingScreen() {
  // --- Existing Hooks & State ---
  const [lang, setLanguage] = React.useState(
    i18n.language?.split('-')[0] || 'en',
  );
  const { themed, themeType, setThemeType, theme } = useAppTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  // --- State for New UI Elements ---

  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);

  // Sync language state when i18n language changes
  useEffect(() => {
    const updateLanguage = () => {
      const currentLang = i18n.language?.split('-')[0] || 'en';
      setLanguage(currentLang);
    };

    updateLanguage();
    i18n.on('languageChanged', updateLanguage);

    return () => {
      i18n.off('languageChanged', updateLanguage);
    };
  }, []);

  const user = useAppSelector(selectUser);
  console.log('User data:', user);

  const handleChangeLanguage = () => {
    const newLang = lang === 'en' ? 'vi' : 'en';
    if (newLang === i18n.language) return;
    InteractionManager.runAfterInteractions(() => {
      i18n.changeLanguage(newLang);
    });
  };

  const handleChangeTheme = () => {
    const newTheme = themeType === 'light' ? 'dark' : 'light';
    setThemeType(newTheme);
  };

  const handleSignOut = () => {
    dispatch(signOut());
  };

  // --- Dummy data for user profile ---

  const handleEditProfile = () => {
    navigation.navigate(MainStackNames.CompleteProfile);
  };

  const handleBecomeLawyer = () => {
    navigation.navigate(MainStackNames.LawyerRegistration);
  };

  const settingGroup = useMemo(
    () => [
      {
        Father: TouchableOpacity,
        iconName: 'contrast-outline',
        title: t('setting.theme'),
        onPress: handleChangeTheme,
        children: (
          <TextChild
            text={
              themeType === 'light' ? t('setting.light') : t('setting.dark')
            }
          />
        ),
      },
      {
        Father: TouchableOpacity,
        iconName: 'language-outline',
        title: t('common.language'),
        onPress: handleChangeLanguage,
        children: (
          <TextChild
            text={lang === 'en' ? t('common.english') : t('common.vietnamese')}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, themeType],
  );

  const accountGroup = [
    ...(selectRole(store.getState()) === 'lawyer'
      ? [
          {
            Father: TouchableOpacity,
            iconName: 'calendar-outline',
            title: 'Manage Schedule',
            onPress: () => {
              navigation.navigate(MainStackNames.ScheduleManagement);
            },
            hasArrow: true,
          },
        ]
      : []),
    ...(selectRole(store.getState()) === 'client'
      ? [
          {
            Father: TouchableOpacity,
            iconName: 'person-outline',
            title: t('setting.becomeLawyer'),
            onPress: handleBecomeLawyer,
            hasArrow: true,
          },
        ]
      : []),
    {
      Father: TouchableOpacity,
      iconName: 'lock-closed-outline',
      title: t('setting.password'),
      onPress: () => {},
      hasArrow: true,
    },
    {
      Father: TouchableOpacity,
      iconName: 'help-buoy-outline',
      title: t('setting.support'),
      onPress: () => {},
      hasArrow: true,
    },
    {
      Father: TouchableOpacity,
      iconName: 'shield-checkmark-outline',
      title: t('setting.terms'),
      onPress: () => {},
      hasArrow: true,
    },
    {
      Father: TouchableOpacity,
      iconName: 'log-out-outline',
      title: t('setting.logout'),
      onPress: handleSignOut,
      hasArrow: false,
    },
  ];

  return (
    <SafeAreaView style={themed(styles.container)} edges={['top', 'bottom']}>
      <Header title={t('setting.title')} showBackButton={true} />

      {/* Header */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: verticalScale(80) }}
      >
        <View style={themed(styles.profileSection)}>
          {user?.avatar ? (
            <Image
              source={{ uri: user?.avatar }}
              style={themed(styles.avatar)}
            />
          ) : (
            <Icon
              name={'person-circle-outline'}
              size={scale(theme.spacing.xxxxxxl)}
              color={theme.colors.onBackground}
            />
          )}
          <Text style={themed(styles.profileName)}>{user?.username}</Text>
          <Text style={themed(styles.profileEmail)}>{user?.email}</Text>
          <TouchableOpacity
            style={themed(styles.editButton)}
            onPress={handleEditProfile}
          >
            <Text style={themed(styles.editButtonText)}>
              {t('setting.editProfile')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Preference */}

        <View style={themed(styles.section)}>
          <Text style={themed(styles.sectionTitle)}>
            {t('setting.preferences')}
          </Text>

          <View style={themed(styles.group)}>
            {settingGroup.map((item, index) => (
              <View key={index}>
                <item.Father onPress={item.onPress} style={themed(styles.row)}>
                  <Icon
                    name={item.iconName as any}
                    size={moderateScale(theme.fontSizes.lg)}
                    color={theme.colors.outline}
                  />
                  <Text style={themed(styles.rowLabel)}>{item.title}</Text>
                  {item.children}
                </item.Father>
                {index !== settingGroup.length - 1 && (
                  <View style={themed(styles.separator)} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Account */}

        <View style={themed(styles.section)}>
          <Text style={themed(styles.sectionTitle)}>
            {t('setting.account')}
          </Text>

          <View style={themed(styles.group)}>
            {accountGroup.map((item, index) => (
              <View key={index}>
                <item.Father onPress={item.onPress} style={themed(styles.row)}>
                  <Icon
                    name={item.iconName as any}
                    size={moderateScale(theme.fontSizes.lg)}
                    color={item.hasArrow ? theme.colors.outline : '#FF3B30'}
                  />
                  <Text
                    style={
                      item.hasArrow
                        ? themed(styles.rowLabel)
                        : themed(styles.logoutLabel)
                    }
                  >
                    {item.title}
                  </Text>
                  {item.hasArrow && (
                    <Icon
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.outline}
                    />
                  )}
                </item.Father>
                {index !== accountGroup.length - 1 && (
                  <View style={themed(styles.separator)} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

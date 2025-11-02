import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../theme/theme.provider';
import * as styles from './styles';
import Logo from '../../../assets/imgs/Logo.png'; // logo bạn đã có
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export default function WelcomeScreen() {
  const { themed } = useAppTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const handleCreateAccount = () => {
    navigation.navigate('SignUp');
  };

  const handleHaveAccount = () => {
    navigation.navigate('SignIn');
  };

  return (
    <SafeAreaView style={themed(styles.container)}>
      <View style={themed(styles.centerContent)}>
        <Image source={Logo} style={themed(styles.logo)} resizeMode="contain" />

        <Text style={themed(styles.appName)}>{t('common.appName')}</Text>
        <Text style={themed(styles.slogan)}>
          {t('welcomeScreen.slogan')}
        </Text>

        <View style={themed(styles.buttonGroup)}>
          <TouchableOpacity
            style={themed(styles.primaryButton)}
            onPress={handleCreateAccount}
          >
            <Text style={themed(styles.buttonText)}>{t('welcomeScreen.createAccount')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={themed(styles.primaryButton)}
            onPress={handleHaveAccount}
          >
            <Text style={themed(styles.buttonText)}>{t('welcomeScreen.haveAccount')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

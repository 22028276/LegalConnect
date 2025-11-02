/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAppTheme } from '../../../theme/theme.provider';
import * as styles from './styles';
import Header from '../../../components/layout/header';
import { useTranslation } from 'react-i18next';

export default function ResetSuccessScreen() {
  const navigation = useNavigation<any>();
  const { themed } = useAppTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={themed(styles.container)}>
      <Header title={t('auth.resetSuccess.title')} />
      <ScrollView contentContainerStyle={themed(styles.scrollContainer)}>
        <View style={themed(styles.formContainer)}>
          <Text style={themed(styles.description)}>
            {t('auth.resetSuccess.description')}
          </Text>

          <TouchableOpacity
            style={themed(styles.primaryButton)}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={themed(styles.primaryButtonText)}>
              {t('auth.resetSuccess.backToLogin')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {false && (
        <View style={themed(styles.loadingContainer)}>
          <ActivityIndicator />
        </View>
      )}
    </SafeAreaView>
  );
}

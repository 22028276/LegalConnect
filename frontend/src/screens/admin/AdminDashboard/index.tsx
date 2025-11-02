import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as styles from './styles';
import { useAppTheme } from '../../../theme/theme.provider';
import { moderateScale } from 'react-native-size-matters';
import Icon from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import CreateDocumentModal from './CreateDocumentModal';
import { useAppDispatch } from '../../../redux/hook';
import { fetchDocuments } from '../../../stores/document.slice';
import { useTranslation } from 'react-i18next';

export default function AdminDashboardScreen() {
  const { themed, theme } = useAppTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const [showModal, setShowModal] = useState(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const handleProfilePress = () => {
    navigation.navigate('Setting');
  };

  return (
    <SafeAreaView style={themed(styles.simpleContainer)}>
      <View style={themed(styles.headerContainer)}>
        <View style={themed(styles.searchContainer)}>
          <Text style={themed(styles.simpleTitle)}>{t('admin.dashboard')}</Text>
        </View>
        <TouchableOpacity
          onPress={handleProfilePress}
          style={themed(styles.profileButton)}
        >
          <Icon
            name="person"
            size={moderateScale(theme.fontSizes.lg)}
            color={theme.colors.surface}
          />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {/* Lawyer Verification Requests Card */}
        <View style={themed(styles.simpleCard)}>
          <Text style={themed(styles.simpleCardTitle)}>
            {t('admin.lawyerVerificationRequests')}
          </Text>
          <Text style={themed(styles.simpleDescription)}>
            {t('admin.reviewAndApproveLawyerVerificationRequests')}
          </Text>
          <TouchableOpacity
            style={themed(styles.simpleButton)}
            onPress={() => navigation.navigate('VerificationRequests')}
          >
            <Text style={themed(styles.simpleButtonText)}>
              {t('admin.viewRequests')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Document Management Card */}
        <View style={themed(styles.simpleCard)}>
          <Text style={themed(styles.simpleCardTitle)}>
            {t('admin.documentManagement')}
          </Text>
          <TouchableOpacity
            style={themed(styles.simpleButton)}
            onPress={() => setShowModal(true)}
          >
            <Text style={themed(styles.simpleButtonText)}>
              {t('admin.createDocument')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={themed(styles.simpleButton)}
            onPress={() => navigation.navigate('DocumentList')}
          >
            <Text style={themed(styles.simpleButtonText)}>
              {t('admin.viewDocuments')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CreateDocumentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          dispatch(fetchDocuments());
        }}
      />
    </SafeAreaView>
  );
}

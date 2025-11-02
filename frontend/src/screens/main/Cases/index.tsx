import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../../theme/theme.provider';
import Header from '../../../components/layout/header';
import * as styles from './styles';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MainStackNames } from '../../../navigation/routes';
import { Case, BookingRequest } from '../../../types/case';
// import { verticalScale } from 'react-native-size-matters';
import CaseCard from '../../../components/common/caseCard';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import {
  fetchPendingCase,
  fetchUserCases,
  selectCases,
  selectPendingCases,
} from '../../../stores/case.slice';

type TabType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type DisplayItem = Case | BookingRequest;

export default function CasesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const { themed } = useAppTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const pendingCases = useAppSelector(selectPendingCases);
  const cases = useAppSelector(selectCases);

  // Helper function to check if item is BookingRequest
  const isBookingRequest = (item: DisplayItem): item is BookingRequest => {
    return 'short_description' in item && 'status' in item;
  };

  const tabs = useMemo(
    () => [
      { key: 'PENDING' as TabType, label: t('cases.pending') },
      { key: 'IN_PROGRESS' as TabType, label: t('cases.inProgress') },
      { key: 'COMPLETED' as TabType, label: t('cases.completed') },
      { key: 'CANCELLED' as TabType, label: t('cases.cancelled') },
    ],
    [t],
  );

  // Get data based on active tab
  const displayData = useMemo(() => {
    if (activeTab === 'PENDING') {
      // Filter to show only PENDING booking requests, exclude ACCEPTED and DECLINED
      return pendingCases.filter(item => {
        if (isBookingRequest(item)) {
          return item.status === 'PENDING';
        }
        return true; // Keep non-booking-request items (shouldn't happen in pending tab)
      });
    }
    return cases.filter(caseItem => caseItem.state === activeTab);
  }, [activeTab, pendingCases, cases]);

  useEffect(() => {
    dispatch(fetchPendingCase());
    dispatch(fetchUserCases());
  }, [dispatch]);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(fetchPendingCase());
      dispatch(fetchUserCases());
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  const renderCaseCard = ({ item }: { item: DisplayItem }) => {
    // Convert BookingRequest to Case format for display in card
    // Pass the original status for pending requests so it displays correctly
    const caseData: Case = isBookingRequest(item)
      ? {
          id: item.id,
          booking_request_id: item.id,
          lawyer_id: item.lawyer_id,
          client_id: item.client_id,
          title: item.title,
          description: item.short_description,
          state: (item.status === 'PENDING' 
            ? 'PENDING' 
            : item.status === 'ACCEPTED' 
            ? 'IN_PROGRESS' 
            : 'CANCELLED') as Case['state'], // Map booking status to case state, including PENDING for display
          attachment_urls: [],
          lawyer_note: '',
          client_note: `Status: ${item.status}`,
          started_at: item.desired_start_time,
          ending_time: item.desired_end_time,
          create_at: item.create_at,
          updated_at: item.updated_at,
        }
      : item;

    return (
      <CaseCard
        caseData={caseData}
        onPress={() =>
          // Pass the original item (BookingRequest) so CaseDetail can detect it correctly
          navigation.navigate(MainStackNames.CaseDetail, { caseData: item })
        }
        stylesOverride={{
          cardContainer: () => ({
            width: '100%',
            marginHorizontal: 0,
          }),
        }}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={themed(styles.content)}>
      <Text style={themed(styles.placeholderText)}>
        {t('cases.noCasesFound', { status: t(`cases.${activeTab}`) })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={themed(styles.container)}>
      <Header title={t('cases.title')} showBackButton={false} />
      <View style={themed(styles.tabContainer)}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={themed(styles.tab(activeTab === tab.key))}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={themed(styles.tabText(activeTab === tab.key))}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={displayData}
        renderItem={renderCaseCard}
        keyExtractor={item => item.id}
        contentContainerStyle={themed(styles.listContainer)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

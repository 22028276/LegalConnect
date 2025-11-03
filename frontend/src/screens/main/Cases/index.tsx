import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppTheme } from '../../../theme/theme.provider';
import Header from '../../../components/layout/header';
import * as styles from './styles';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { MainStackNames } from '../../../navigation/routes';
import { Case, BookingRequest, CaseStatus } from '../../../types/case';
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
import { RatingModal } from './RatingModal';

type TabType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type DisplayItem = Case | BookingRequest;

export default function CasesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const { themed } = useAppTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const pendingCases = useAppSelector(selectPendingCases);
  const cases = useAppSelector(selectCases);

  const tabs = useMemo(
    () => [
      { key: 'PENDING' as TabType, label: t('cases.pending') },
      { key: 'IN_PROGRESS' as TabType, label: t('cases.inProgress') },
      { key: 'COMPLETED' as TabType, label: t('cases.completed') },
      { key: 'CANCELLED' as TabType, label: t('cases.cancelled') },
    ],
    [t],
  );

  const displayData = useMemo(() => {
    if (activeTab === 'PENDING') {
      return pendingCases.filter(
        pendingCase => pendingCase.status === 'PENDING',
      );
    }
    return cases.filter(caseItem => caseItem.state === activeTab);
  }, [activeTab, pendingCases, cases]);

  const fetchData = () => {
    dispatch(fetchPendingCase());
    dispatch(fetchUserCases());
  };
  // Fetch data every time screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // Helper function to check if item is BookingRequest
  const isBookingRequest = (item: DisplayItem): item is BookingRequest => {
    return 'short_description' in item && 'status' in item;
  };

  const handleRatePress = (caseId: string) => {
    setSelectedCaseId(caseId);
    setIsRatingModalVisible(true);
  };

  const handleRatingModalClose = () => {
    setIsRatingModalVisible(false);
    setSelectedCaseId(null);
  };

  const handleRatingSuccess = () => {
    fetchData();
  };

  const renderCaseCard = ({ item }: { item: DisplayItem }) => {
    const isPendingItem = isBookingRequest(item);

    // Convert BookingRequest to Case format for display in card
    const caseData: Case = isPendingItem
      ? {
          id: item.id,
          booking_request_id: item.id,
          lawyer_id: item.lawyer_id,
          client_id: item.client_id,
          title: item.title,
          description: item.short_description,
          state: item.status as CaseStatus,
          attachment_urls: [],
          lawyer_note: '',
          client_note: `${t('cases.statusPrefix')} ${item.status}`,
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
          navigation.navigate(MainStackNames.CaseDetail, {
            caseId: item.id,
            isPending: isPendingItem,
          })
        }
        onRatePress={
          !isPendingItem && caseData.state === 'COMPLETED'
            ? () => handleRatePress(item.id)
            : undefined
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
          {t(`cases.no${activeTab}Cases`)}
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
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={fetchData} />
        }
      />
      {selectedCaseId && (
        <RatingModal
          isVisible={isRatingModalVisible}
          onClose={handleRatingModalClose}
          caseId={selectedCaseId}
          onSuccess={handleRatingSuccess}
        />
      )}
    </SafeAreaView>
  );
}

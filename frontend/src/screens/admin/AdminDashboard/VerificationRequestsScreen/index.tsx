import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../../../theme/theme.provider';
import Header from '../../../../components/layout/header';
import * as styles from './styles';
import { VerificationRequest } from '../../../../types/verification';
import { getAllVerificationRequests } from '../../../../services/verification';
import { showError } from '../../../../types/toast';
import { moderateScale } from 'react-native-size-matters';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTranslation } from 'react-i18next';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function VerificationRequestsScreen() {
  const { themed, theme } = useAppTheme();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<
    VerificationRequest[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const fetchRequests = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const data = await getAllVerificationRequests();
      setRequests(data);
      filterRequestsByStatus(data, filterStatus);
    } catch (error: any) {
      showError(
        t('admin.error'),
        error?.response?.data?.message || t('admin.failedToFetchRequests'),
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterRequestsByStatus = (
    data: VerificationRequest[],
    status: FilterStatus,
  ) => {
    if (status === 'all') {
      setFilteredRequests(data);
    } else {
      setFilteredRequests(data.filter(req => req.status === status));
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh data when screen comes into focus
      fetchRequests();
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  useEffect(() => {
    filterRequestsByStatus(requests, filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.processStatus.pending.textColor;
      case 'approved':
        return theme.colors.processStatus.approved.textColor;
      case 'rejected':
        return theme.colors.processStatus.rejected.textColor;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('admin.pending');
      case 'approved':
        return t('admin.approved');
      case 'rejected':
        return t('admin.rejected');
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const renderRequestItem = ({ item }: { item: VerificationRequest }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={themed(styles.requestCard)}
        onPress={() =>
          navigation.navigate('VerificationRequestDetail', {
            requestId: item.id,
          })
        }
        activeOpacity={0.7}
      >
        <View style={themed(styles.cardHeader)}>
          <View style={themed(styles.userInfo)}>
            <Text style={themed(styles.userName)}>
              {t('admin.userID')}: {item.user_id.slice(0, 8)}...
            </Text>
            <Text style={themed(styles.userEmail)}>
              {t('admin.submitted')}: {formatDate(item.create_at)}
            </Text>
          </View>
          <View
            style={[
              themed(styles.statusBadge),
              { backgroundColor: statusColor as any },
            ]}
          >
            <Text
              style={[
                themed(styles.statusText),
                { color: theme.colors.onPrimary },
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={themed(styles.cardBody)}>
          <View style={themed(styles.infoRow)}>
            <Ionicons
              name="briefcase-outline"
              size={moderateScale(16)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>{t('admin.position')}:</Text>
            <Text style={themed(styles.infoValue)}>
              {item.current_job_position}
            </Text>
          </View>

          <View style={themed(styles.infoRow)}>
            <Ionicons
              name="time-outline"
              size={moderateScale(16)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.infoLabel)}>{t('admin.experience')}:</Text>
            <Text style={themed(styles.infoValue)}>
              {item.years_of_experience} {t('admin.years')}
            </Text>
          </View>

          {item.rejection_reason && (
            <View style={themed(styles.infoRow)}>
              <Ionicons
                name="close-circle-outline"
                size={moderateScale(16)}
                color={theme.colors.error}
              />
              <Text
                style={[
                  themed(styles.infoLabel),
                  { color: theme.colors.error },
                ]}
              >
                {t('admin.rejectionReason')}:
              </Text>
              <Text
                style={[
                  themed(styles.infoValue),
                  { color: theme.colors.error },
                ]}
              >
                {item.rejection_reason}
              </Text>
            </View>
          )}

          {item.reviewed_at && (
            <View style={themed(styles.infoRow)}>
              <Ionicons
                name="checkmark-circle-outline"
                size={moderateScale(16)}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={themed(styles.infoLabel)}>{t('admin.reviewed')}:</Text>
              <Text style={themed(styles.infoValue)}>
                {formatDate(item.reviewed_at)}
              </Text>
            </View>
          )}
        </View>

        {/* Tap to view details indicator */}
        <View style={themed(styles.cardFooter)}>
          <Text style={themed(styles.tapToViewText)}>
            {t('admin.tapToViewDetails')}
          </Text>
          <Ionicons
            name="chevron-forward-outline"
            size={moderateScale(16)}
            color={theme.colors.primary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (status: FilterStatus, label: string) => {
    const isActive = filterStatus === status;
    return (
      <TouchableOpacity
        style={[
          themed(styles.filterButton),
          isActive
            ? themed(styles.filterButtonActive)
            : themed(styles.filterButtonInactive),
        ]}
        onPress={() => setFilterStatus(status)}
      >
        <Text
          style={[
            themed(styles.filterButtonText),
            isActive
              ? themed(styles.filterButtonTextActive)
              : themed(styles.filterButtonTextInactive),
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={themed(styles.emptyContainer)}>
      <Ionicons
        name="document-text-outline"
        size={moderateScale(64)}
        color={theme.colors.onSurfaceVariant}
      />
      <Text style={themed(styles.emptyText)}>
        {filterStatus === 'all'
          ? t('admin.noVerificationRequestsFound')
          : t('admin.noStatusRequestsFound', { status: filterStatus })}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={themed(styles.container)} edges={['top', 'bottom']}>
        <Header title={t('admin.verificationRequests')} />
        <View style={themed(styles.emptyContainer)}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themed(styles.container)} edges={['top', 'bottom']}>
      <Header title={t('admin.verificationRequests')} />

      <View style={themed(styles.filterContainer)}>
        {renderFilterButton('all', t('admin.all'))}
        {renderFilterButton('pending', t('admin.pending'))}
        {renderFilterButton('approved', t('admin.approved'))}
        {renderFilterButton('rejected', t('admin.rejected'))}
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequestItem}
        keyExtractor={item => item.id}
        contentContainerStyle={
          filteredRequests.length === 0
            ? themed(styles.emptyListContent)
            : themed(styles.listContent)
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchRequests(true)}
            colors={[theme.colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

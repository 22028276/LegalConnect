import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../../theme/theme.provider';
import Header from '../../../components/layout/header';
import LawyerCard from '../../../components/common/lawyerCard';
import * as styles from './styles';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import {
  fetchAllLawyers,
  selectLawyers,
  selectIsLoading,
} from '../../../stores/lawyer.slices';
import { Lawyer } from '../../../types/lawyer';
import { MainStackNames } from '../../../navigation/routes';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Input from '../../../components/common/input';
import RadioGroup from '../../../components/common/radio';

export default function AllLawyersScreen() {
  const { themed, theme } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useAppDispatch();
  const lawyers = useAppSelector(selectLawyers);
  const isLoading = useAppSelector(selectIsLoading);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchAllLawyers());
  }, [dispatch]);

  const refetchData = () => {
    dispatch(fetchAllLawyers());
  };

  const getFilteredLawyers = () => {
    let filtered = [...lawyers];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        lawyer =>
          lawyer.display_name?.toLowerCase().includes(query) ||
          lawyer.education?.toLowerCase().includes(query) ||
          lawyer.office_address?.toLowerCase().includes(query),
      );
    }

    // Apply sort filter
    if (selectedFilter === 'featured') {
      // Sort by rating descending
      filtered.sort((a, b) => {
        const ratingA = a.average_rating || 0;
        const ratingB = b.average_rating || 0;
        return ratingB - ratingA;
      });
    } else if (selectedFilter === 'new') {
      // Sort by created_at descending (newest first)
      filtered.sort((a, b) => {
        const dateA = a.create_at ? new Date(a.create_at).getTime() : 0;
        const dateB = b.create_at ? new Date(b.create_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    return filtered;
  };

  const filteredLawyers = getFilteredLawyers();

  const renderLawyerCard = ({ item }: { item: Lawyer }) => (
    <View style={themed(styles.cardWrapper)}>
      <LawyerCard
        id={item.user_id}
        displayName={item.display_name}
        officeAddress={item.office_address}
        education={item.education}
        averageRating={item.average_rating}
        currentLevel={item.current_level}
        imageUrl={item.image_url}
        onPress={() => {
          navigation.navigate(MainStackNames.LawyerProfile, {
            id: item.user_id,
          });
        }}
        stylesOverride={{
          cardContainer: {
            width: '100%',
            marginHorizontal: 0,
            marginVertical: 0,
          },
        }}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={themed(styles.emptyContainer)}>
      <Text style={themed(styles.emptyText)}>
        {searchQuery.trim()
          ? t('lawyers.noLawyersFound')
          : t('lawyers.noLawyers')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={themed(styles.container)} edges={['top', 'bottom']}>
      <Header title={t('lawyers.title')} showBackButton={true} />

      {/* Search Input */}
      <View style={themed(styles.searchContainer)}>
        <Input
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('lawyers.searchPlaceholder')}
          icon="search"
          styles={{
            container: themed(styles.searchInputContainer),
            inputWrapper: themed(styles.searchInputWrapper),
          }}
        />
      </View>

      {/* Filter Tabs */}
      <View style={themed(styles.filterContainer)}>
        <RadioGroup
          options={[
            { label: t('common.all'), value: 'all' },
            { label: t('home.featured'), value: 'featured' },
            { label: t('home.newest'), value: 'new' },
          ]}
          selected={selectedFilter}
          onChange={setSelectedFilter}
        />
      </View>

      {/* Lawyers List */}
      {isLoading && lawyers.length === 0 ? (
        <View style={themed(styles.loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredLawyers}
          renderItem={renderLawyerCard}
          keyExtractor={(item, index) =>
            item?.id ? String(item.id) : `lawyer-${index}`
          }
          contentContainerStyle={themed(styles.listContainer)}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          numColumns={2}
          columnWrapperStyle={
            filteredLawyers.length > 0 ? themed(styles.row) : undefined
          }
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetchData} />
          }
        />
      )}
    </SafeAreaView>
  );
}

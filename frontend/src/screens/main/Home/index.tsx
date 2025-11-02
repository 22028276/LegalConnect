import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  ImageStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LawyerCard from '../../../components/common/lawyerCard';
import { useAppTheme } from '../../../theme/theme.provider';
import RadioGroup from '../../../components/common/radio';
import { moderateScale } from 'react-native-size-matters';
import * as styles from './styles';
import CaseCard from '../../../components/common/caseCard';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import {
  fetchPopularDocuments,
  selectDocuments,
} from '../../../stores/document.slice';
import DocumentCard from '../../../components/common/documentCard';
import {
  fetchPopularLawyers,
  selectLawyers,
} from '../../../stores/lawyer.slices';
import { Lawyer } from '../../../types/lawyer';
import { MainStackNames } from '../../../navigation/routes';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Input from '../../../components/common/input';
import Icon from '@react-native-vector-icons/ionicons';
import { useTranslation } from 'react-i18next';
import { fetchUserCases, selectCases } from '../../../stores/case.slice';
import { Case } from '../../../types/case';
import { Document } from '../../../types/document';
import { selectUser } from '../../../stores/user.slice';

// Separator component for horizontal list
const ItemSeparator = () => <View style={{ width: moderateScale(12) }} />;

export default function HomeScreen() {
  const { themed, theme } = useAppTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useAppDispatch();
  const documentsData = useAppSelector(selectDocuments);
  const lawyersData = useAppSelector(selectLawyers);
  const cases = useAppSelector(selectCases);
  const casesData = cases.filter(caseItem => caseItem.state === 'IN_PROGRESS');
  const { t } = useTranslation();
  useEffect(() => {
    dispatch(fetchPopularDocuments());
    dispatch(fetchPopularLawyers());
    dispatch(fetchUserCases());
  }, [dispatch]);
  const user = useAppSelector(selectUser);
  const refetchData = () => {
    dispatch(fetchPopularDocuments());
    dispatch(fetchPopularLawyers());
    dispatch(fetchUserCases());
  };

  const getFilteredLawyers = () => {
    let filtered = [...lawyersData];

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

  const handleProfilePress = () => {
    navigation.navigate(MainStackNames.Setting);
  };

  const renderDocumentCard = ({ item }: { item: Document }) => (
    <DocumentCard
      document={item}
      onPress={() => {
        navigation.navigate(MainStackNames.PdfViewer, {
          url: item.file_url,
          title: item.display_name,
        });
      }}
    />
  );

  const renderCaseCard = ({ item }: { item: Case }) => (
    <CaseCard
      caseData={item}
      onPress={() => {
        navigation.navigate(MainStackNames.CaseDetail, {
          caseId: item.id,
          isPending: false,
        });
      }}
    />
  );

  const renderLawyerCard = ({ item }: { item: Lawyer }) => (
    <LawyerCard
      id={item.user_id}
      displayName={item.display_name}
      officeAddress={item.office_address}
      education={item.education}
      averageRating={item.average_rating}
      currentLevel={item.current_level}
      imageUrl={item.image_url}
      onPress={() => {
        navigation.navigate(MainStackNames.LawyerProfile, { id: item.user_id });
      }}
    />
  );

  return (
    <SafeAreaView style={themed(styles.container)} edges={['top', 'bottom']}>
      <ScrollView
        style={themed(styles.scrollView)}
        contentContainerStyle={themed(styles.scrollContent)}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetchData} />
        }
      >
        {/* Header với search và profile icon */}
        <View style={themed(styles.headerContainer)}>
          <View style={themed(styles.searchContainer)}>
            <Input
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('home.search')}
              icon="search"
              styles={{
                container: themed(styles.searchInputContainer),
                inputWrapper: themed(styles.searchInputWrapper),
              }}
            />
          </View>
          <TouchableOpacity
            onPress={handleProfilePress}
            style={themed(styles.profileButton)}
          >
            {user?.avatar && user.avatar.trim() !== '' ? (
              <View style={themed(styles.profileImageContainer)}>
                <Image
                  source={{ uri: user.avatar }}
                  style={themed(styles.profileImage) as ImageStyle}
                  resizeMode="cover"
                  onError={e => {
                    console.log('Avatar image error:', e);
                  }}
                  onLoad={() => {
                    console.log('Avatar loaded successfully:', user.avatar);
                  }}
                />
              </View>
            ) : (
              <Icon
                name="person"
                size={moderateScale(theme.fontSizes.lg)}
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={themed(styles.listContainer)}>
          <View style={themed(styles.sectionHeader)}>
            <Text style={themed(styles.sectionTitle)}>
              {t('home.featuredLawyers')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(MainStackNames.AllLawyers);
              }}
            >
              <Text style={themed(styles.viewMoreText)}>
                {t('home.viewMore')} {'>'}
              </Text>
            </TouchableOpacity>
          </View>

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

          {filteredLawyers.length > 0 ? (
            <FlatList
              data={filteredLawyers}
              renderItem={renderLawyerCard}
              keyExtractor={(item, index) =>
                item?.id !== undefined ? String(item.id) : `lawyer-${index}`
              }
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
              contentContainerStyle={themed(styles.horizontalListContent)}
              ItemSeparatorComponent={ItemSeparator}
            />
          ) : (
            <View style={themed(styles.noDataContainer)}>
              <Text style={themed(styles.noDataText)}>{t('home.noData')}</Text>
            </View>
          )}
        </View>
        <View style={themed(styles.listContainer)}>
          <View style={themed(styles.sectionHeader)}>
            <Text style={themed(styles.sectionTitle)}>
              {t('home.caseProgress')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(MainStackNames.Cases);
              }}
            >
              <Text style={themed(styles.viewMoreText)}>
                {t('home.viewMore')} {'>'}
              </Text>
            </TouchableOpacity>
          </View>
          {casesData.length > 0 ? (
            <FlatList
              data={(casesData || []).filter(Boolean)}
              renderItem={renderCaseCard}
              keyExtractor={(item, index) => item?.id || `case-${index}`}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
              contentContainerStyle={themed(styles.horizontalListContent)}
              ItemSeparatorComponent={ItemSeparator}
            />
          ) : (
            <View style={themed(styles.noDataContainer)}>
              <Text style={themed(styles.noDataText)}>{t('home.noData')}</Text>
            </View>
          )}
        </View>
        <View style={themed(styles.listContainer)}>
          <View style={themed(styles.sectionHeader)}>
            <Text style={themed(styles.sectionTitle)}>
              {t('home.featuredDocuments')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(MainStackNames.Documents);
              }}
            >
              <Text style={themed(styles.viewMoreText)}>
                {t('home.viewMore')} {'>'}
              </Text>
            </TouchableOpacity>
          </View>
          {documentsData.length > 0 ? (
            <FlatList
              data={documentsData}
              renderItem={renderDocumentCard}
              keyExtractor={(item, index) => item?.id || `doc-${index}`}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
              contentContainerStyle={themed(styles.horizontalListContent)}
              ItemSeparatorComponent={ItemSeparator}
            />
          ) : (
            <View style={themed(styles.noDataContainer)}>
              <Text style={themed(styles.noDataText)}>{t('home.noData')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

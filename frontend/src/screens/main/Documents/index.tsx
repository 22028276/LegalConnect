import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  View,
  FlatList,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAppTheme } from '../../../theme/theme.provider';
import { moderateScale } from 'react-native-size-matters';
import * as styles from './styles';
import Ionicons from '@react-native-vector-icons/ionicons';
import RadioGroup from '../../../components/common/radio';
import Header from '../../../components/layout/header';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../utils/formatDate';
import { MainStackNames } from '../../../navigation/routes';
import { useNavigation } from '@react-navigation/native';
import {
  fetchDocuments,
  selectDocuments,
  selectIsLoading,
} from '../../../stores/document.slice';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';

// Separator component for document list
const ItemSeparator = () => <View style={{ height: moderateScale(12) }} />;

export default function DocumentsScreen() {
  const { themed, theme } = useAppTheme();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const documents = useAppSelector(selectDocuments);
  const isLoading = useAppSelector(selectIsLoading);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const getDocuments = async () => {
    await dispatch(fetchDocuments());
    console.log('documents: ', documents);
  };
  useEffect(() => {
    getDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const renderDocumentItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={themed(styles.documentCard)}
      onPress={() =>
        navigation.navigate(MainStackNames.PdfViewer, {
          url: item.file_url,
          title: item.display_name,
        })
      }
    >
      <View style={themed(styles.documentIconContainer)}>
        <Ionicons
          name="document-text-outline"
          size={moderateScale(24)}
          color={theme.colors.primary}
        />
      </View>
      <View style={themed(styles.documentInfo)}>
        <Text style={themed(styles.documentName)}>{item.display_name}</Text>
        <Text style={themed(styles.documentTime)}>
          {formatDate(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
  // const renderDocumentSection = (docType: string, documents: any[]) => (
  //   <View key={docType} style={themed(styles.documentSection)}>
  //     <Text style={themed(styles.sectionTitle)}>{docType}</Text>
  //     <FlatList
  //       data={documents}
  //       renderItem={renderDocumentItem}
  //       keyExtractor={item => item.id}
  //       scrollEnabled={false}
  //       ItemSeparatorComponent={ItemSeparator}
  //     />
  //   </View>
  // );

  // const getFilteredData = () => {
  //   if (selectedFilter === 'All') {
  //     return documentData;
  //   }
  //   return {
  //     [selectedFilter]:
  //       documentData[selectedFilter as keyof typeof documentData] || [],
  //   };
  // };

  return (
    <SafeAreaView style={themed(styles.container)} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <Header title={t('documents.title')} showBackButton={false} />
      <View style={themed(styles.filterContainer)}>
        <RadioGroup
          options={[
            { label: t('documents.all'), value: 'All' },
            { label: 'DocType 1', value: 'DocType 1' },
            { label: 'DocType 2', value: 'DocType 2' },
          ]}
          selected={selectedFilter}
          onChange={setSelectedFilter}
        />
      </View>

      <FlatList
        data={documents}
        renderItem={renderDocumentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={themed(styles.scrollContent)}
        ItemSeparatorComponent={ItemSeparator}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={getDocuments} />
        }
      />
    </SafeAreaView>
  );
}

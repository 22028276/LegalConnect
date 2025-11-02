import React, { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useAppTheme } from '../../../../theme/theme.provider';
import ReviewCard from '../../../../components/common/reviewCard/index.tsx';
import * as styles from './styles';
import { getLawyerRatings } from '../../../../services/lawyer';
import { Rating } from '../../../../types/rating';
import { t } from '../../../../i18n';

export default function Review({ lawyerId }: { lawyerId: string }) {
  const { themed } = useAppTheme();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRatings = async () => {
      try {
        const data = await getLawyerRatings(lawyerId);
        if (isMounted) {
          setRatings(data);
          setLoading(false);
        }
      } catch (error) {
        console.log('Error fetching ratings:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchRatings();
    return () => {
      isMounted = false;
    };
  }, [lawyerId]);

  if (loading) {
    return (
      <View style={themed(styles.container)}>
        <Text style={themed(styles.loadingText)}>{t('lawyerProfile.loadingReviews')}</Text>
      </View>
    );
  }

  if (ratings.length === 0) {
    return (
      <View style={themed(styles.container)}>
        <Text style={themed(styles.noReviewsText)}>{t('lawyerProfile.noReviewsYet')}</Text>
      </View>
    );
  }

  return (
    <View style={themed(styles.container)}>
      <FlatList
        data={ratings}
        renderItem={({ item }) => (
          <ReviewCard
            name={`${t('lawyerProfile.client')} ${item.client_id.slice(0, 8)}`}
            date={new Date(item.create_at).toLocaleDateString()}
            reviewText={t('lawyerProfile.ratedStars', { stars: item.stars })}
            rating={item.stars}
            profileImage={undefined}
            reviewImages={undefined}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={themed(styles.listContainer)}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        nestedScrollEnabled={true}
      />
    </View>
  );
}

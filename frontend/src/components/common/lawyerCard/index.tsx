import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../../theme/theme.provider';
import { moderateScale } from 'react-native-size-matters';
import Icon from '@react-native-vector-icons/ionicons';
import * as styles from './styles';
interface LawyerCardProps {
  id: string;
  displayName: string;
  officeAddress?: string;
  education?: string;
  averageRating?: number;
  currentLevel?: string;
  imageUrl?: string;
  onPress?: () => void;
  stylesOverride?: {
    cardContainer?: any;
  };
}

export default function LawyerCard({
  id: _id,
  displayName,
  officeAddress: _officeAddress,
  education,
  averageRating,
  currentLevel,
  imageUrl,
  onPress,
  stylesOverride,
}: LawyerCardProps) {
  const { themed, theme } = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        themed(styles.cardContainer),
        stylesOverride?.cardContainer && themed(stylesOverride.cardContainer),
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={themed(styles.imageContainer)}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={themed(styles.profileImage)}
          />
        ) : (
          <View style={themed(styles.profilePlaceholder)}>
            <Icon
              name="person-circle-outline"
              size={moderateScale(theme.fontSizes.xl * 2)}
              color={theme.colors.outline}
            />
          </View>
        )}
      </View>

      <View style={themed(styles.contentContainer)}>
        <Text style={themed(styles.nameText)} numberOfLines={1}>
          {displayName}
        </Text>

        {education ? (
          <Text style={themed(styles.descriptionText)} numberOfLines={2}>
            {education}
          </Text>
        ) : null}

        {currentLevel ? (
          <View style={themed(styles.bottomRow)}>
            <Icon
              name="briefcase-outline"
              size={moderateScale(theme.fontSizes.sm)}
              color={theme.colors.primary}
            />
            <Text style={themed(styles.ratingText)}>{currentLevel}</Text>
          </View>
        ) : null}

        {typeof averageRating === 'number' ? (
          <View style={themed(styles.bottomRow)}>
            <Icon
              name="star"
              size={moderateScale(theme.fontSizes.sm)}
              color={theme.colors.primary}
            />
            <Text style={themed(styles.ratingText)}>
              {averageRating.toFixed(1)}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppTheme } from '../../../theme/theme.provider';
import * as styles from './styles';
import Header from '../../../components/layout/header';
import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { ScheduleSlot } from '../../../services/booking';
import {
  getMySchedule,
  createScheduleSlot,
  updateScheduleSlot,
  deleteScheduleSlot,
  ScheduleSlotCreatePayload,
} from '../../../services/booking';
import Icon from '@react-native-vector-icons/ionicons';
import { moderateScale } from 'react-native-size-matters';
import DatePicker from '../../../components/common/datePicker';
import { useTranslation } from 'react-i18next';

export default function ScheduleManagementScreen() {
  const { themed, theme } = useAppTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await getMySchedule();
      setSchedules(data || []);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSchedules();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      });
    } catch {
      return dateString;
    }
  };

  const handleAddSlot = () => {
    setEditingSlot(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    setSelectedDate(tomorrow);
    setStartTime('09:00');
    setEndTime('10:00');
    setShowModal(true);
  };

  const handleEditSlot = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    const startDate = new Date(slot.start_time);
    setSelectedDate(startDate);
    
    // Extract time in HH:MM format
    const startHours = String(startDate.getHours()).padStart(2, '0');
    const startMinutes = String(startDate.getMinutes()).padStart(2, '0');
    setStartTime(`${startHours}:${startMinutes}`);
    
    const endDate = new Date(slot.end_time);
    const endHours = String(endDate.getHours()).padStart(2, '0');
    const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
    setEndTime(`${endHours}:${endMinutes}`);
    
    setShowModal(true);
  };

  const handleDeleteSlot = (slot: ScheduleSlot) => {
    Alert.alert(
      t('schedule.deleteScheduleSlot'),
      t('schedule.deleteScheduleSlotConfirm'),
      [
        { text: t('schedule.cancel'), style: 'cancel' },
        {
          text: t('schedule.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScheduleSlot(slot.id);
              loadSchedules();
            } catch (error) {
              console.error('Failed to delete slot:', error);
            }
          },
        },
      ],
    );
  };

  const parseTime = (timeString: string): { hours: number; minutes: number } | null => {
    const parts = timeString.split(':');
    if (parts.length !== 2) return null;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    
    return { hours, minutes };
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      Alert.alert(t('schedule.invalidInput'), t('schedule.pleaseSelectDate'));
      return;
    }

    const startTimeParts = parseTime(startTime);
    const endTimeParts = parseTime(endTime);

    if (!startTimeParts || !endTimeParts) {
      Alert.alert(
        t('schedule.invalidInput'),
        t('schedule.invalidTimeFormat'),
      );
      return;
    }

    // Create start and end datetime on the selected date
    const startDate = new Date(selectedDate);
    startDate.setHours(startTimeParts.hours, startTimeParts.minutes, 0, 0);
    
    const endDate = new Date(selectedDate);
    endDate.setHours(endTimeParts.hours, endTimeParts.minutes, 0, 0);

    if (endDate <= startDate) {
      Alert.alert(
        t('schedule.invalidTime'),
        t('schedule.endTimeAfterStart'),
      );
      return;
    }

    if (startDate < new Date()) {
      Alert.alert(
        t('schedule.invalidTime'),
        t('schedule.startTimeFuture'),
      );
      return;
    }

    try {
      setSubmitting(true);
      const payload: ScheduleSlotCreatePayload = {
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      };

      if (editingSlot) {
        await updateScheduleSlot(editingSlot.id, payload);
      } else {
        await createScheduleSlot(payload);
      }

      setShowModal(false);
      loadSchedules();
    } catch (error) {
      console.error('Failed to save slot:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderScheduleItem = ({ item }: { item: ScheduleSlot }) => {
    const isBooked = item.is_booked;
    const isPast = new Date(item.end_time) < new Date();
    const startDate = new Date(item.start_time);
    const endDate = new Date(item.end_time);
    const durationHours = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
    );

    return (
      <View style={themed(styles.scheduleCard)}>
        <View style={themed(styles.scheduleHeader)}>
          <View style={themed(styles.dateContainer)}>
            <Icon
              name="calendar-outline"
              size={moderateScale(20)}
              color={theme.colors.primary}
            />
            <Text style={themed(styles.dateText)}>
              {formatDate(item.start_time)}
            </Text>
          </View>
          <View
            style={[
              themed(styles.statusBadge),
              isBooked && themed(styles.statusBadgeBooked),
              isPast && themed(styles.statusBadgePast),
            ]}
          >
            <Text
              style={[
                themed(styles.statusText),
                isBooked && themed(styles.statusTextBooked),
              ]}
            >
              {isBooked ? t('schedule.booked') : isPast ? t('schedule.past') : t('schedule.available')}
            </Text>
          </View>
        </View>

        <View style={themed(styles.timeRow)}>
          <View style={themed(styles.timeContainer)}>
            <Icon
              name="time-outline"
              size={moderateScale(18)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.timeLabel)}>{t('schedule.startLabel')}:</Text>
            <Text style={themed(styles.timeValue)}>
              {formatTime(item.start_time)}
            </Text>
          </View>
          <Icon
            name="arrow-forward"
            size={moderateScale(16)}
            color={theme.colors.onSurfaceVariant}
          />
          <View style={themed(styles.timeContainer)}>
            <Icon
              name="time-outline"
              size={moderateScale(18)}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={themed(styles.timeLabel)}>{t('schedule.endLabel')}:</Text>
            <Text style={themed(styles.timeValue)}>
              {formatTime(item.end_time)}
            </Text>
          </View>
        </View>

        <View style={themed(styles.durationContainer)}>
          <Icon
            name="hourglass-outline"
            size={moderateScale(16)}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={themed(styles.durationText)}>
            {t('schedule.durationLabel')}: {durationHours} {durationHours === 1 ? t('schedule.hour') : t('schedule.hours')}
          </Text>
        </View>

        {!isBooked && !isPast && (
          <View style={themed(styles.actionButtons)}>
            <TouchableOpacity
              style={[themed(styles.actionButton), themed(styles.editButton)]}
              onPress={() => handleEditSlot(item)}
            >
              <Icon
                name="create-outline"
                size={moderateScale(18)}
                color={theme.colors.primary}
              />
              <Text style={themed(styles.actionButtonText)}>
                {t('schedule.edit')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[themed(styles.actionButton), themed(styles.deleteButton)]}
              onPress={() => handleDeleteSlot(item)}
            >
              <Icon
                name="trash-outline"
                size={moderateScale(18)}
                color={theme.colors.error}
              />
              <Text
                style={[
                  themed(styles.actionButtonText),
                  { color: theme.colors.error },
                ]}
              >
                {t('schedule.delete')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={themed(styles.emptyContainer)}>
      <Icon
        name="calendar-clear-outline"
        size={moderateScale(64)}
        color={theme.colors.onSurfaceVariant}
      />
      <Text style={themed(styles.emptyTitle)}>
        {t('schedule.noScheduleSlots')}
      </Text>
      <Text style={themed(styles.emptyMessage)}>
        {t('schedule.addScheduleSlotsMessage')}
      </Text>
      <TouchableOpacity
        style={themed(styles.emptyAddButton)}
        onPress={handleAddSlot}
      >
        <Icon
          name="add-circle"
          size={moderateScale(24)}
          color={theme.colors.onPrimary}
        />
        <Text style={themed(styles.emptyAddButtonText)}>
          {t('schedule.addScheduleSlot')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={themed(styles.container)}>
      <Header
        title={t('schedule.manageSchedule')}
        showBackButton={true}
        rightIcon={
          <TouchableOpacity onPress={handleAddSlot}>
            <Icon
              name="add-circle-outline"
              size={moderateScale(28)}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        }
      />
      <View style={themed(styles.content)}>
        {loading ? (
          <View style={themed(styles.loadingContainer)}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={themed(styles.loadingText)}>
              {t('schedule.loadingSchedules')}
            </Text>
          </View>
        ) : (
          <>
            {schedules.length > 0 && (
              <View style={themed(styles.headerInfo)}>
                <Text style={themed(styles.headerTitle)}>
                  {t('schedule.yourScheduleSlots')} ({schedules.length})
                </Text>
                <Text style={themed(styles.headerSubtitle)}>
                  {t('schedule.manageAvailableSlots')}
                </Text>
              </View>
            )}
            <FlatList
              data={schedules}
              renderItem={renderScheduleItem}
              keyExtractor={item => item.id}
              contentContainerStyle={themed(styles.listContainer)}
              ListEmptyComponent={renderEmptyState}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={themed(styles.modalOverlay)}>
          <View style={themed(styles.modalContent)}>
            <View style={themed(styles.modalHeader)}>
              <Text style={themed(styles.modalTitle)}>
                {editingSlot ? t('schedule.editScheduleSlot') : t('schedule.addScheduleSlotTitle')}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon
                  name="close"
                  size={moderateScale(24)}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={themed(styles.modalBody)}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={themed(styles.timePickerContainer)}>
                <DatePicker
                  label={t('schedule.date')}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minimumDate={new Date()}
                  placeholder={t('schedule.selectDate')}
                />
              </View>

              <View style={themed(styles.timePickerContainer)}>
                <Text style={themed(styles.timePickerLabel)}>
                  {t('schedule.startTime')}
                </Text>
                <View style={themed(styles.inputWrapper)}>
                  <Icon
                    name="time-outline"
                    size={moderateScale(20)}
                    color={theme.colors.primary}
                  />
                  <TextInput
                    style={themed(styles.textInput)}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder={t('schedule.defaultStartTimePlaceholder')}
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={themed(styles.inputHint)}>
                  {t('schedule.timeFormatHint')}
                </Text>
              </View>

              <View style={themed(styles.timePickerContainer)}>
                <Text style={themed(styles.timePickerLabel)}>
                  {t('schedule.endTime')}
                </Text>
                <View style={themed(styles.inputWrapper)}>
                  <Icon
                    name="time-outline"
                    size={moderateScale(20)}
                    color={theme.colors.primary}
                  />
                  <TextInput
                    style={themed(styles.textInput)}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder={t('schedule.defaultEndTimePlaceholder')}
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={themed(styles.inputHint)}>
                  {t('schedule.timeFormatHint')}
                </Text>
              </View>

              <View style={themed(styles.buttonRow)}>
                <TouchableOpacity
                  style={themed(styles.cancelButton)}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={themed(styles.cancelButtonText)}>
                    {t('schedule.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    themed(styles.submitButton),
                    submitting && themed(styles.submitButtonDisabled),
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.onPrimary}
                    />
                  ) : (
                    <Text style={themed(styles.submitButtonText)}>
                      {editingSlot ? t('schedule.update') : t('schedule.create')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

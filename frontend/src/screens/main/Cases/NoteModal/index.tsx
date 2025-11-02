import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../../../theme/theme.provider';
import Icon from '@react-native-vector-icons/ionicons';
import { moderateScale } from 'react-native-size-matters';
import * as styles from './styles';
import { useTranslation } from 'react-i18next';
import { showSuccess } from '../../../../types/toast';
import { useAppDispatch } from '../../../../redux/hook';
import { addCaseNote } from '../../../../stores/case.slice';

export const AddNoteModal = ({
  isAddNoteModalVisible,
  setIsAddNoteModalVisible,
  caseId,
  onSuccess,
}: {
  isAddNoteModalVisible: boolean;
  setIsAddNoteModalVisible: (visible: boolean) => void;
  caseId: string;
  onSuccess?: () => void;
}) => {
  const { themed, theme } = useAppTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setNoteText('');
    setIsAddNoteModalVisible(false);
  };

  const handleSave = async () => {
    if (!noteText.trim()) return;

    setSaving(true);
    try {
      await dispatch(addCaseNote({ caseId, note: noteText.trim() })).unwrap();

      // Show success toast before closing modal
      showSuccess(t('toast.addNoteSuccessful'));

      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error saving note:', err);
      // Error toast already shown in service layer
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={isAddNoteModalVisible}
      onRequestClose={handleClose}
      transparent
      animationType="fade"
    >
      <Pressable style={themed(styles.modalOverlay)} onPress={handleClose}>
        <Pressable
          style={themed(styles.modalContainer)}
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View style={themed(styles.modalHeader)}>
            <Text style={themed(styles.modalTitle)}>
              {t('caseDetail.addNote')}
            </Text>
            <TouchableOpacity
              style={themed(styles.closeButton)}
              onPress={handleClose}
            >
              <Icon
                name="close"
                size={moderateScale(24)}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={themed(styles.modalContent)}>
            <TextInput
              style={themed(styles.textInput)}
              placeholder={t('caseDetail.notePlaceholder')}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              autoFocus
            />
          </View>

          {/* Footer */}
          <View style={themed(styles.modalFooter)}>
            <TouchableOpacity
              style={themed(styles.cancelButton)}
              onPress={handleClose}
              disabled={saving}
            >
              <Text style={themed(styles.cancelButtonText)}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                themed(styles.saveButton),
                (!noteText.trim() || saving) &&
                  themed(styles.saveButtonDisabled),
              ]}
              onPress={handleSave}
              disabled={!noteText.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.onPrimary}
                />
              ) : (
                <Text style={themed(styles.saveButtonText)}>
                  {t('common.save')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

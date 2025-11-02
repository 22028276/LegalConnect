import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../../../theme/theme.provider';
import * as styles from './styles';
import FilePicker, { File } from '../../../../components/common/filePicker';
import { addCaseFiles } from '../../../../stores/case.slice';
import { useAppDispatch } from '../../../../redux/hook';
import { useTranslation } from 'react-i18next';
import { showSuccess } from '../../../../types/toast';
export const AddFileModal = ({
  isVisible,
  setIsVisible,
  caseId,
  onSuccess,
}: {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  caseId: string;
  onSuccess?: () => void;
}) => {
  const { themed, theme } = useAppTheme();
  const [files, setFiles] = useState<File[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const handleClose = () => {
    setFiles(null);
    setError(null);
    setIsVisible(false);
  };

  const validateForm = () => {
    if (!files || files.length === 0) {
      setError(t('caseDetail.selectFilesError'));
      return false;
    }
    setError(null);
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setUploading(true);
    setError(null);

    try {
      await dispatch(
        addCaseFiles({ caseId, files: files as unknown as File }),
      ).unwrap();

      // Show success toast before closing modal
      showSuccess(t('toast.uploadFileSuccessful'));

      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        t('caseDetail.uploadError');
      setError(message);
      console.error('Error uploading files:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      onRequestClose={handleClose}
      transparent
      animationType="slide"
    >
      <View style={themed(styles.modalOverlay)}>
        <View style={themed(styles.modalBox)}>
          <Text style={themed(styles.modalTitle)}>
            {t('caseDetail.addFiles')}
          </Text>

          <FilePicker
            fileType="file"
            value={files}
            onChange={v => setFiles(v as File[] | null)}
            label={t('caseDetail.selectFiles')}
            error={error && (!files || files.length === 0) ? error : undefined}
          />

          <Text style={themed(styles.fileHintText)}>
            {t('caseDetail.fileHint')}
          </Text>

          {error && <Text style={themed(styles.errorText)}>{error}</Text>}

          <View style={themed(styles.buttonRow)}>
            <TouchableOpacity
              style={themed(styles.cancelButton)}
              onPress={handleClose}
              disabled={uploading}
            >
              <Text style={themed(styles.cancelButtonText)}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={themed(styles.submitBtn)}
              onPress={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.onPrimary}
                />
              ) : (
                <Text style={themed(styles.submitBtnText)}>
                  {t('caseDetail.upload')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

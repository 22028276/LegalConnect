import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../../../theme/theme.provider';
import FilePicker, {
  File as PickedFile,
} from '../../../../components/common/filePicker';
import { showError, showSuccess } from '../../../../types/toast';
import * as styles from './styles';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../../redux/hook';
import { addDocument, updateDoc } from '../../../../stores/document.slice';
import { Document } from '../../../../types/document';

interface CreateDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  document?: Document | null; // Document để edit (nếu có)
}

export default function CreateDocumentModal(props: CreateDocumentModalProps) {
  const { visible, onClose, onSuccess, document } = props;
  const { themed, theme } = useAppTheme();
  const isEditMode = !!document;
  const { t } = useTranslation();

  const [displayName, setDisplayName] = useState('');
  const [file, setFileState] = useState<PickedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  // Prefill form khi edit
  useEffect(() => {
    if (document) {
      setDisplayName(document.display_name || '');
      // File không cần set vì đã có trên server
    } else {
      setDisplayName('');
      setFileState(null);
    }
    setError(null);
  }, [document, visible]);
  const validateForm = () => {
    if (!displayName.trim()) {
      setError(t('admin.displayNameRequired'));
      return false;
    }
    if (displayName.length > 255 || displayName.length < 1) {
      setError(t('admin.displayNameLength'));
      return false;
    }

    // Khi tạo mới: bắt buộc phải có file
    // Khi edit: file là optional (nếu không đổi file thì giữ nguyên)
    if (!isEditMode && !file) {
      setError(t('admin.selectPdfFile'));
      return false;
    }

    // Nếu có chọn file mới thì validate
    if (file && file.type && !file.type.includes('pdf')) {
      setError(t('admin.onlyPdfAllowed'));
      return false;
    }

    setError(null);
    return true;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError(null);

    try {
      if (isEditMode && document) {
        // Edit mode: update document
        await dispatch(
          updateDoc({
            id: document.id,
            title: displayName,
            document: file ? (file as unknown as File) : undefined, // Chỉ gửi file nếu có chọn file mới
          }),
        ).unwrap();
        showSuccess(t('toast.updateDocumentSuccessful'));
      } else {
        // Create mode: add new document
        if (!file) {
          setError(t('admin.selectPdfFile'));
          return;
        }
        await dispatch(
          addDocument({ title: displayName, document: file }),
        ).unwrap();
        showSuccess(t('toast.createDocumentSuccessful'));
      }

      setDisplayName('');
      setFileState(null);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        isEditMode
          ? t('admin.errorUpdatingDocument')
          : t('admin.errorUploadingDocument');
      showError(t('toast.uploadFailed'), message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setDisplayName('');
    setFileState(null);
    setError(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={themed(styles.modalOverlay)}>
        <View style={themed(styles.modalBox)}>
          <Text style={themed(styles.modalTitle)}>
            {isEditMode ? t('admin.editDocument') : t('admin.createNewDocument')}
          </Text>

          <Text style={themed(styles.fieldLabel)}>{t('admin.displayName')} *</Text>
          <TextInput
            placeholder={t('admin.enterDocumentName')}
            value={displayName}
            onChangeText={setDisplayName}
            style={themed(styles.input)}
            maxLength={255}
            placeholderTextColor={theme.colors.outline}
          />

          <FilePicker
            fileType="file"
            value={file}
            onChange={v => setFileState(v as PickedFile | null)}
            label={isEditMode ? t('admin.pdfDocumentOptional') : `${t('admin.pdfDocument')} *`}
            required={!isEditMode}
            error={error && !file && !isEditMode ? error : undefined}
          />

          {isEditMode && document?.file_url && !file && (
            <Text style={themed(styles.fieldLabel)}>
              {t('admin.currentFile')}: {document.original_filename || t('admin.defaultDocumentName')}
            </Text>
          )}

          {error && <Text style={themed(styles.errorText)}>{error}</Text>}

          <View style={themed(styles.buttonRow)}>
            <TouchableOpacity
              onPress={resetAndClose}
              style={themed(styles.cancelButton)}
            >
              <Text style={themed(styles.cancelButtonText)}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSubmit}
              style={themed(styles.submitBtn)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color={theme.colors.onPrimary}
                  size="small"
                />
              ) : (
                <Text style={themed(styles.submitBtnText)}>
                  {isEditMode ? t('admin.update') : t('admin.submit')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

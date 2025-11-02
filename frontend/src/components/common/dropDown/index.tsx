import React, { useRef } from 'react';
import { Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import { t } from '../../../i18n';
import { useAppTheme } from '../../../theme/theme.provider';
import * as styles from './styles';

export type DropDownSelectStyleOverride = {
  container?: ViewStyle;
  label?: TextStyle;
  inputContainer?: ViewStyle;
  inputContainerError?: ViewStyle;
  errorText?: TextStyle;
  buttonPlaceholder?: TextStyle;
  buttonText?: TextStyle;
  containerStyle?: ViewStyle;
  inputSearchStyle?: ViewStyle;
  itemText?: TextStyle;
};

export interface DropDownSelectProps {
  mode?: 'single' | 'multiple';
  dropDownMode?: 'default' | 'modal' | 'auto';
  label?: string;
  value: any | any[];
  options: { label: string; value: any }[];
  onSelect: (value: any | any[]) => void;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  placeholder?: string;
  error?: string;
  [key: string]: any;
  styles?: DropDownSelectStyleOverride;
}

export default function DropDownSelect({
  mode = 'single',
  dropDownMode = 'auto',
  label,
  value,
  options,
  onSelect,
  enableSearch,
  searchPlaceholder = t('home.search'),
  placeholder = t('common.select'),
  error,
  styles: styleOverrides,
  ...restProps
}: DropDownSelectProps) {
  const { theme, themed } = useAppTheme();
  const dropDownRef = useRef<any>(null);
  const DropDownComponent: any = mode === 'single' ? Dropdown : MultiSelect;

  const getValue = () => {
    if (mode === 'single') {
      if (Array.isArray(value)) {
        return value[0] || '';
      }
      return value || '';
    } else {
      if (Array.isArray(value)) {
        return value;
      }
      return value ? [value] : [];
    }
  };

  const handleChange = (item: any) => {
    if (mode === 'single') {
      onSelect(item?.value || '');
    } else {
      onSelect(Array.isArray(item) ? item : [item]);
    }
  };

  return (
    <View style={[themed(styles.container), styleOverrides?.container]}>
      {label && (
        <Text style={[themed(styles.label), styleOverrides?.label]}>
          {label}
        </Text>
      )}
      <Pressable onPress={() => dropDownRef.current?.open()}>
        <DropDownComponent
          ref={dropDownRef}
          mode={dropDownMode}
          data={options}
          value={getValue()}
          onChange={handleChange}
          labelField="label"
          valueField="value"
          searchPlaceholder={searchPlaceholder}
          placeholder={placeholder}
          placeholderStyle={{
            ...themed(styles.buttonPlaceholder),
            ...styleOverrides?.buttonPlaceholder,
          }}
          selectedTextStyle={{
            ...themed(styles.buttonText),
            ...styleOverrides?.buttonText,
          }}
          containerStyle={{
            ...themed(styles.containerStyle),
            ...styleOverrides?.containerStyle,
          }}
          inputSearchStyle={{
            ...themed(styles.inputSearchStyle),
            ...styleOverrides?.inputSearchStyle,
          }}
          itemTextStyle={{
            ...themed(styles.itemText),
            ...styleOverrides?.itemText,
          }}
          style={[
            themed(styles.inputContainer),
            styleOverrides?.inputContainer,
            error && themed(styles.inputContainerError),
            error && styleOverrides?.inputContainerError,
          ]}
          activeColor={theme.colors.surfaceContainer}
          {...(enableSearch && {
            search: true,
            searchPlaceholder: searchPlaceholder,
          })}
          {...restProps}
        />
      </Pressable>
      {error && (
        <Text style={[themed(styles.errorText), styleOverrides?.errorText]}>
          {error}
        </Text>
      )}
    </View>
  );
}

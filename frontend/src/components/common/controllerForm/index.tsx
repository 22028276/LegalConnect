import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { StyleSheet, Switch, View } from 'react-native';
import Input from '../input';
import RadioGroup from '../radio';
import DatePicker from '../datePicker';
import FilePicker from '../filePicker';
import DropDownSelect from '../dropDown';

export default function ControllerForm({
  fields,
  control,
}: {
  fields: any[];
  control: UseFormReturn<any>;
}) {
  return (
    <View style={styles.container}>
      {fields.map(fieldParams => {
        const {
          id,
          name,
          type,
          rules,
          customRender,
          defaultValue,
          ...restProps
        } = fieldParams;
        return (
          <Controller
            key={id}
            control={control.control}
            name={name}
            rules={rules}
            defaultValue={
              type === 'checkbox' || type === 'switch'
                ? defaultValue ?? false
                : undefined
            }
            render={({ field: { value, onChange } }) => {
              switch (type) {
                case 'select':
                  return (
                    <DropDownSelect
                      {...restProps}
                      value={value}
                      onSelect={onChange}
                    />
                  );
                case 'radio':
                  return (
                    <RadioGroup
                      {...restProps}
                      selected={value}
                      onChange={onChange}
                    />
                  );
                // case 'checkbox':
                //   return (
                //     <Checkbox
                //       {...restProps}
                //       checked={value}
                //       onChange={onChange}
                //     />
                //   );
                // case 'toggle':
                //   return (
                //     <Toggle
                //       {...restProps}
                //       selected={value}
                //       onChange={onChange}
                //     />
                //   );
                case 'date':
                  return (
                    <DatePicker
                      {...restProps}
                      value={value}
                      onChange={onChange}
                    />
                  );
                // case 'time':
                //   return (
                //     <DatePicker
                //       {...restProps}
                //       initialView="time"
                //       value={value}
                //       onChange={onChange}
                //       disableMonthPicker
                //       disableYearPicker
                //       timePicker
                //     />
                //   );
                // case 'number':
                //   return (
                //     <NumberPicker
                //       {...restProps}
                //       value={value}
                //       onChange={onChange}
                //     />
                //   );
                case 'switch':
                  return (
                    <Switch
                      {...restProps}
                      checked={value}
                      onChange={onChange}
                    />
                  );
                case 'file':
                  return (
                    <FilePicker
                      {...restProps}
                      value={value}
                      onChange={onChange}
                    />
                  );
                case 'customRender':
                  return customRender(value, onChange, { ...restProps });
                default:
                  return (
                    <Input {...restProps} value={value} onChange={onChange} />
                  );
              }
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    gap: 10,
    marginBottom: 10,
  },
});

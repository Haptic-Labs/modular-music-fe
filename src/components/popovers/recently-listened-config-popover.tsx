import { Database, RecentlyListenedConfig } from '../../types';
import { Form, useForm } from '@mantine/form';
import { useEffect } from 'react';
import {
  Button,
  Popover,
  PopoverDropdownProps,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';

type RecentlyListenedConfigPopoverProps = {
  initialConfig?: Partial<RecentlyListenedConfig>;
  onSave: (config: RecentlyListenedConfig) => void;
} & PopoverDropdownProps;

export const RecentlyListenedConfigPopover = ({
  initialConfig,
  onSave,
  ...popoverProps
}: RecentlyListenedConfigPopoverProps) => {
  const minMaxQuantityMap: Record<
    Database['public']['Enums']['RECENTLY_PLAYED_INTERVAL'],
    { min: number; max: number }
  > = {
    DAYS: {
      min: 1,
      max: 90,
    },
    WEEKS: {
      min: 1,
      max: 12,
    },
    MONTHS: {
      min: 1,
      max: 3,
    },
  };

  const form = useForm({
    initialValues: {
      quantity: initialConfig?.quantity,
      interval: initialConfig?.interval ?? 'DAYS',
    },
    validate: {
      quantity: (number, { interval }) =>
        number === undefined
          ? null
          : number > minMaxQuantityMap[interval].max
            ? `Maximum recently listened time is ${minMaxQuantityMap[interval].max} ${interval.toLowerCase()}`
            : number < minMaxQuantityMap[interval].min
              ? `Must be at least 1 ${interval.toLowerCase().slice(0, -1)}`
              : null,
    },
    validateInputOnChange: true,
  });

  const valuesHaveChanges = initialConfig ? form.isDirty() : true;

  useEffect(() => {
    form.resetDirty();
  }, [JSON.stringify(initialConfig)]);

  useEffect(() => {
    form.validateField('quantity');
  }, [form.values.interval]);

  return (
    <Popover.Dropdown {...popoverProps} w={225}>
      <Form
        form={form}
        onSubmit={() => {
          if (form.values.quantity) {
            onSave({
              quantity: form.values.quantity,
              interval: form.values.interval,
            });
          }
        }}
      >
        <Stack gap='xs'>
          <TextInput
            label='Quantity'
            {...form.getInputProps('quantity')}
            placeholder={`Enter amount of ${form.values.interval.toLowerCase()}...`}
            color={
              form.errors.quantity && form.getTouched().quantity
                ? 'red'
                : undefined
            }
          />
          <Select
            label='Interval'
            {...form.getInputProps('interval')}
            onChange={(value) =>
              form.setFieldValue(
                'interval',
                value as Database['public']['Enums']['RECENTLY_PLAYED_INTERVAL'],
              )
            }
            data={[
              { value: 'DAYS', label: 'Days' },
              { value: 'WEEKS', label: 'Weeks' },
              { value: 'MONTHS', label: 'Months' },
            ]}
          />
          <Button
            disabled={
              !form.isValid() || !form.values.quantity || !valuesHaveChanges
            }
            type='submit'
          >
            Save
          </Button>
        </Stack>
      </Form>
    </Popover.Dropdown>
  );
};

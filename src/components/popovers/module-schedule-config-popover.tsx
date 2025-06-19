import {
  Button,
  Group,
  LoadingOverlay,
  NumberInput,
  Popover,
  PopoverDropdownProps,
  Select,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { Database } from '../../types';
import { useForm } from '@mantine/form';
import { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';

const transformFormValues = (
  config: Partial<ScheduleConfig> = {},
): ScheduleConfig => ({
  repeatConfig: {
    enabled: !!config.repeatConfig?.enabled,
    interval: config.repeatConfig?.interval ?? 'WEEKS',
    quantity: config.repeatConfig?.quantity ?? 1,
  },
});

const MotionGroup = motion(Group);

export type ScheduleConfig = {
  repeatConfig: Database['public']['CompositeTypes']['ModuleScheduleConfig'] & {
    enabled: boolean;
  };
};

type ModuleScheduleConfigPopoverProps = {
  initialConfig?: Partial<ScheduleConfig>;
  isOpen: boolean;
  onSave: (config: ScheduleConfig) => void;
  onDeleteSchedule: () => void;
  isSaving: boolean;
} & PopoverDropdownProps;

export const ModuleScheduleConfigPopover = ({
  initialConfig,
  isOpen,
  onSave,
  onDeleteSchedule,
  isSaving,
  ...popoverDropdownProps
}: ModuleScheduleConfigPopoverProps) => {
  const theme = useMantineTheme();
  const form = useForm<ScheduleConfig>({
    mode: 'controlled',
    initialValues: transformFormValues(initialConfig),
    validate: {
      repeatConfig: {
        quantity: (value, { repeatConfig }) =>
          repeatConfig.enabled
            ? !value || value < 1
              ? 'Invalid repetition'
              : null
            : null,
        interval: (value, { repeatConfig }) =>
          repeatConfig.enabled && !value ? 'Invalid repetition' : null,
      },
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const hasValueChange = useMemo(() => {
    const transformedValues = transformFormValues(initialConfig);
    if (
      transformedValues.repeatConfig.enabled !==
      form.values.repeatConfig.enabled
    ) {
      return true;
    }
    if (
      transformedValues.repeatConfig.interval !==
      form.values.repeatConfig.interval
    ) {
      return true;
    }
    if (
      transformedValues.repeatConfig.quantity !==
      form.values.repeatConfig.quantity
    ) {
      return true;
    }
    return false;
  }, [initialConfig, form.values]);

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen]);

  useEffect(() => {
    form.setInitialValues(transformFormValues(initialConfig));
    form.reset();
  }, [initialConfig]);

  return (
    <Popover.Dropdown
      css={(theme) => ({ backgroundColor: theme.colors.dark[8] })}
      {...popoverDropdownProps}
    >
      <form onSubmit={form.onSubmit((values) => onSave(values))}>
        <Stack gap={0} miw={279}>
          <Text css={{ fontWeight: 'bold', marginBottom: theme.spacing.sm }}>
            Set Module Schedule:
          </Text>
          <Stack>
            <Group gap='xs'>
              <Text size='sm'>Run every</Text>
              <NumberInput
                w={75}
                styles={{ input: { backgroundColor: 'transparent' } }}
                placeholder='Enter a number'
                {...form.getInputProps('repeatConfig.quantity')}
              />
              <Select
                w={120}
                styles={{ input: { backgroundColor: 'transparent' } }}
                data={[
                  { value: 'DAYS', label: 'Days' },
                  { value: 'WEEKS', label: 'Weeks' },
                  { value: 'MONTHS', label: 'Months' },
                  { value: 'YEARS', label: 'Years' },
                ]}
                {...form.getInputProps('repeatConfig.interval')}
                placeholder='Select an interval'
                comboboxProps={{ withinPortal: false }}
              />
            </Group>
          </Stack>
          <MotionGroup
            gap='xs'
            pos='relative'
            initial={{ paddingTop: theme.spacing.sm }}
            animate={{
              paddingTop: form.values.repeatConfig.enabled
                ? theme.spacing.md
                : 0,
            }}
            exit={{ paddingTop: 0 }}
          >
            {isSaving && <LoadingOverlay />}
            <Button
              flex={1}
              size='sm'
              disabled={!initialConfig?.repeatConfig}
              color='red'
              onClick={onDeleteSchedule}
              variant='outline'
            >
              Delete
            </Button>
            <Button
              flex={1}
              size='sm'
              disabled={!hasValueChange || !form.isValid}
              type='submit'
            >
              Save
            </Button>
          </MotionGroup>
        </Stack>
      </form>
    </Popover.Dropdown>
  );
};

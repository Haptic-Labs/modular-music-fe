import {
  Button,
  Checkbox,
  Divider,
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
import { DateTimePicker } from '@mantine/dates';
import { Database } from '../../types';
import { useForm } from '@mantine/form';
import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const transformFormValues = (
  config: Partial<ScheduleConfig> = {},
): ScheduleConfig => ({
  repeatConfig: {
    enabled: !!config.repeatConfig?.enabled,
    interval: config.repeatConfig?.interval ?? 'WEEKS',
    quantity: config.repeatConfig?.quantity ?? 1,
  },
  nextScheduledRun:
    config?.nextScheduledRun ??
    new Date(new Date().getTime() + 86400000).toISOString(),
});

const MotionGroup = motion(Group);
const MotionStack = motion(Stack);

export type ScheduleConfig = {
  nextScheduledRun: string;
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
      nextScheduledRun: (value) => {
        return new Date(value).toISOString() >
          new Date(new Date().getTime() + 300000).toISOString()
          ? null
          : 'Must be at least 5 mins in the future';
      },
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
    if (transformedValues.nextScheduledRun !== form.values.nextScheduledRun) {
      return true;
    }
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
  }, [JSON.stringify(initialConfig)]);

  return (
    <Popover.Dropdown
      css={(theme) => ({ backgroundColor: theme.colors.dark[8] })}
      {...popoverDropdownProps}
    >
      <form
        onSubmit={form.onSubmit((values) =>
          onSave({
            ...values,
            nextScheduledRun: new Date(values.nextScheduledRun).toISOString(),
          }),
        )}
      >
        <Stack gap={0} miw={279}>
          <Text css={{ fontWeight: 'bold' }}>Set Module Schedule:</Text>
          <DateTimePicker
            {...form.getInputProps('nextScheduledRun')}
            label='Next run'
            valueFormat='ddd, MMM D, YY [at] h:mm a'
            minDate={new Date(new Date().getTime() + 300000)}
            timePickerProps={{
              format: '12h',
              withDropdown: true,
              minutesStep: 15,
              popoverProps: {
                withinPortal: false,
              },
              error: form.errors.nextScheduledRun,
              errorProps: {
                style: {
                  textWrap: 'pretty',
                },
              },
            }}
            firstDayOfWeek={0}
            highlightToday
            popoverProps={{ withinPortal: false }}
            css={(theme) => ({
              '.mantine-DateTimePicker-submitButton': {
                backgroundColor: !form.errors.nextScheduledRun
                  ? theme.colors.green[7]
                  : undefined,
                borderColor: form.errors.nextScheduledRun
                  ? theme.colors.red[7]
                  : undefined,
                pointerEvents: form.errors.nextScheduledRun
                  ? 'none'
                  : undefined,
                ':hover': {
                  backgroundColor: !form.errors.nextScheduledRun
                    ? theme.colors.green[9]
                    : 'transparent',
                },
              },
            })}
          />
          <Checkbox
            {...form.getInputProps('repeatConfig.enabled', {
              type: 'checkbox',
            })}
            labelPosition='left'
            label='Repeat:'
            my='md'
          />
          <AnimatePresence>
            {form.values.repeatConfig.enabled && (
              <MotionStack
                initial={{
                  height: 0,
                  overflow: 'hidden',
                }}
                animate={
                  form.values.repeatConfig.enabled
                    ? {
                        height: 'auto',
                        overflow: 'hidden',
                      }
                    : {
                        height: 0,
                        overflow: 'hidden',
                      }
                }
                exit={{
                  height: 0,
                  overflow: 'hidden',
                }}
              >
                <Divider />
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
              </MotionStack>
            )}
          </AnimatePresence>
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
              disabled={!initialConfig?.nextScheduledRun}
              color='red'
              onClick={onDeleteSchedule}
              variant='outline'
              loading={isSaving}
            >
              Delete
            </Button>
            <Button
              flex={1}
              size='sm'
              disabled={!hasValueChange || !form.isValid}
              type='submit'
              loading={isSaving}
            >
              Save
            </Button>
          </MotionGroup>
        </Stack>
      </form>
    </Popover.Dropdown>
  );
};

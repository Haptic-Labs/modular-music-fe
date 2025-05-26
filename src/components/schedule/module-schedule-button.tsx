import { Button, Popover, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconClock, IconClockEdit } from '@tabler/icons-react';
import { ModulesQueries } from '../../queries';
import { useAuth } from '../../providers';
import { ModuleScheduleConfigPopover } from '../popovers';
import { formatTimestamp } from '../../utils';

type ModuleScheduleButtonProps = {
  moduleId: string;
};

export const ModuleScheduleButton = ({
  moduleId,
}: ModuleScheduleButtonProps) => {
  const { user } = useAuth();
  const { data: moduleData, isLoading } = ModulesQueries.useUserModulesQuery(
    {
      userId: user?.id ?? '',
    },
    {
      enabled: !!user?.id && !!moduleId,
      select: (data) => {
        const module = data.find((module) => module.id === moduleId);
        if (!module) return undefined;
        return {
          scheduleConfig: module.schedule_config ?? undefined,
          nextScheduledRun: module.next_scheduled_run ?? undefined,
          previousRun: module.previous_run ?? undefined,
        };
      },
    },
  );
  const { mutate, isPending: isSaving } =
    ModulesQueries.useSetModuleScheduleConfig();
  const [scheduleConfigPopoverIsOpen, scheduleConfigPopoverFns] =
    useDisclosure(false);
  const isScheduled = !!moduleData?.nextScheduledRun;

  return (
    <Popover
      opened={scheduleConfigPopoverIsOpen}
      onChange={(isOpen) =>
        isOpen
          ? scheduleConfigPopoverFns.open()
          : scheduleConfigPopoverFns.close()
      }
    >
      {isScheduled ? (
        <Popover.Target>
          <Button
            variant='light'
            color='blue'
            size='xl'
            justify='start'
            leftSection={<IconClockEdit />}
            onClick={scheduleConfigPopoverFns.open}
            title='Edit Schedule'
            loading={isLoading}
          >
            <Stack gap={0} align='start'>
              <Text>{formatTimestamp(moduleData.nextScheduledRun!)}</Text>
              {!!moduleData?.scheduleConfig && (
                <Text
                  size='sm'
                  css={{ opacity: 0.7 }}
                >{`Repeat every ${(moduleData.scheduleConfig?.quantity ?? 0) < 2 ? '' : (moduleData.scheduleConfig?.quantity?.toLocaleString() ?? '')} ${moduleData.scheduleConfig.interval?.toLowerCase().slice(0, (moduleData.scheduleConfig?.quantity ?? 0) > 1 ? undefined : -1)}`}</Text>
              )}
            </Stack>
          </Button>
        </Popover.Target>
      ) : (
        <Popover.Target>
          <Button
            leftSection={<IconClock />}
            size='xl'
            color='blue'
            variant='light'
            onClick={scheduleConfigPopoverFns.open}
            loading={isLoading}
          >
            <Text size='lg'>Schedule Module</Text>
          </Button>
        </Popover.Target>
      )}
      <ModuleScheduleConfigPopover
        initialConfig={{
          nextScheduledRun: moduleData?.nextScheduledRun,
          repeatConfig: {
            enabled: !!moduleData?.scheduleConfig,
            interval: moduleData?.scheduleConfig?.interval ?? 'WEEKS',
            quantity: moduleData?.scheduleConfig?.quantity ?? 1,
          },
        }}
        isOpen={scheduleConfigPopoverIsOpen}
        onSave={(config) => {
          mutate(
            {
              moduleId,
              config,
            },
            {
              onSuccess: () => {
                scheduleConfigPopoverFns.close();
              },
            },
          );
        }}
        onDeleteSchedule={() => {
          mutate(
            {
              moduleId,
              config: undefined,
            },
            {
              onSuccess: () => {
                scheduleConfigPopoverFns.close();
              },
            },
          );
          scheduleConfigPopoverFns.close();
        }}
        isSaving={isSaving}
      />
    </Popover>
  );
};

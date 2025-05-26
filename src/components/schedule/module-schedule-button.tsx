import { Button, Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconClock } from '@tabler/icons-react';
import { ModulesQueries } from '../../queries';
import { useAuth } from '../../providers';
import { ModuleScheduleConfigPopover } from '../popovers';

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
        };
      },
    },
  );
  const { mutate, isPending: isSaving } =
    ModulesQueries.useSetModuleScheduleConfig();
  const [scheduleConfigPopoverIsOpen, scheduleConfigPopoverFns] =
    useDisclosure(false);

  return (
    <Popover
      opened={scheduleConfigPopoverIsOpen}
      onChange={(isOpen) =>
        isOpen
          ? scheduleConfigPopoverFns.open()
          : scheduleConfigPopoverFns.close()
      }
    >
      <Popover.Target>
        <Button
          color='blue'
          leftSection={<IconClock />}
          onClick={scheduleConfigPopoverFns.open}
          loading={isLoading}
        >
          {moduleData?.nextScheduledRun ? 'Edit Schedule' : 'Schedule Module'}
        </Button>
      </Popover.Target>
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

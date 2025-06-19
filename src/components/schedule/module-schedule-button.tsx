import { Button, Popover, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconClock, IconClockEdit } from '@tabler/icons-react';
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
          previousRun: module.previous_run ?? undefined,
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
      {moduleData?.scheduleConfig ? (
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
            <Text
              size='sm'
              css={{ opacity: 0.7 }}
            >{`Repeat every ${(moduleData.scheduleConfig.quantity ?? 0) < 2 ? '' : (moduleData.scheduleConfig.quantity?.toLocaleString() ?? '')} ${moduleData.scheduleConfig.interval?.toLowerCase().slice(0, (moduleData.scheduleConfig.quantity ?? 0) > 1 ? undefined : -1)}`}</Text>
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
          repeatConfig: {
            enabled: !!moduleData?.scheduleConfig,
            interval: moduleData?.scheduleConfig?.interval ?? 'WEEKS',
            quantity: moduleData?.scheduleConfig?.quantity ?? 1,
          },
        }}
        isOpen={scheduleConfigPopoverIsOpen}
        onSave={({ repeatConfig }) => {
          mutate(
            {
              moduleId,
              config: repeatConfig,
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

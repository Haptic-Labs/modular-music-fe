import { Link, Navigate, useParams } from 'react-router-dom';
import { ModuleSourcesGrid } from '../../components';
import { ModuleActionsList } from '../../components/actions';
import { ModuleOutputsGrid } from '../../components/outputs';
import {
  ActionIcon,
  Button,
  Center,
  Group,
  Loader,
  Stack,
  Title,
} from '@mantine/core';
import { ModulesQueries } from '../../queries';
import { useAuth } from '../../providers';
import { ModuleScheduleButton } from '../../components/schedule';
import { IconArrowLeft } from '@tabler/icons-react';

export const ModulePage = () => {
  const { moduleId } = useParams();
  const { user, supabaseClient } = useAuth();
  const { data: module, isLoading } = ModulesQueries.useUserModulesQuery(
    {
      userId: user?.id ?? '',
    },
    {
      enabled: !!user?.id && !!moduleId,
      select: (data) => {
        const module = data.find((module) => module.id === moduleId);
        return {
          moduleName: module?.name ?? '',
          isRunning: module?.is_running ?? false,
        };
      },
    },
  );
  const { moduleName, isRunning } = module ?? {};

  const handleRun = async () => {
    await supabaseClient.functions.invoke(`/modules/${moduleId}/run`, {
      method: 'POST',
    });
  };

  if (!moduleId) return <Navigate to='/404' />;

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack
      gap='4'
      css={{
        padding: 12,
      }}
    >
      <Group
        align='end'
        justify='space-between'
        mih={65}
        pb='lg'
        css={(theme) => ({
          borderBottom: `1px solid ${theme.colors.gray[8]}`,
        })}
      >
        <Group>
          <ActionIcon
            variant='subtle'
            color='gray'
            component={Link}
            to='/modules'
            size='lg'
          >
            <IconArrowLeft />
          </ActionIcon>
          <Title>{moduleName ?? ''}</Title>
        </Group>
        <Group>
          <Button onClick={handleRun} loading={isRunning} size='lg'>
            Run
          </Button>
          <ModuleScheduleButton moduleId={moduleId} />
        </Group>
      </Group>
      <Stack gap='lg' mt='md'>
        <ModuleSourcesGrid moduleId={moduleId} />
        <ModuleActionsList moduleId={moduleId} />
        <ModuleOutputsGrid moduleId={moduleId} />
      </Stack>
    </Stack>
  );
};

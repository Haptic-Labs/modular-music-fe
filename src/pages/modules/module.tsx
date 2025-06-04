import { Navigate, useParams } from 'react-router-dom';
import { ModuleSourcesGrid } from '../../components';
import { ModuleActionsList } from '../../components/actions';
import { ModuleOutputsGrid } from '../../components/outputs';
import { Button, Center, Group, Loader, Stack, Title } from '@mantine/core';
import { ModulesQueries } from '../../queries';
import { useAuth } from '../../providers';
import { ModuleScheduleButton } from '../../components/schedule';
import { useState } from 'react';

export const ModulePage = () => {
  const { moduleId } = useParams();
  const { user, supabaseClient } = useAuth();
  const { data: moduleName, isLoading } = ModulesQueries.useUserModulesQuery(
    {
      userId: user?.id ?? '',
    },
    {
      enabled: !!user?.id && !!moduleId,
      select: (data) => data.find((module) => module.id === moduleId)?.name,
    },
  );
  const [isRunning, setIsRunning] = useState(false); // TODO: use supabase realtime to track running status

  const handleRun = async () => {
    setIsRunning(true);
    try {
      await supabaseClient.functions.invoke(`/modules/${moduleId}/run`, {
        method: 'POST',
      });
    } finally {
      setIsRunning(false);
    }
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
      <Group align='end' justify='space-between' mih={65}>
        <Title>{moduleName ?? ''}</Title>
        <Group>
          <Button onClick={handleRun} loading={isRunning}>
            Run!
          </Button>
          <ModuleScheduleButton moduleId={moduleId} />
        </Group>
      </Group>
      <ModuleSourcesGrid moduleId={moduleId} />
      <ModuleActionsList moduleId={moduleId} />
      <ModuleOutputsGrid moduleId={moduleId} />
    </Stack>
  );
};

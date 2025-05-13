import { Navigate, useParams } from 'react-router-dom';
import { ModuleSourcesGrid } from '../../components';
import { ModuleActionsList } from '../../components/actions';
import { ModuleOutputsGrid } from '../../components/outputs';
import { Stack } from '@mantine/core';

export const ModulePage = () => {
  const { moduleId } = useParams();

  if (!moduleId) return <Navigate to='/404' />;

  return (
    <Stack
      gap='4'
      css={{
        padding: 12,
      }}
    >
      <ModuleSourcesGrid moduleId={moduleId} />
      <ModuleActionsList moduleId={moduleId} />
      <ModuleOutputsGrid moduleId={moduleId} />
    </Stack>
  );
};

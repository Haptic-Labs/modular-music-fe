import { Navigate, useParams } from 'react-router-dom';
import { Flex } from '@radix-ui/themes';
import { ModuleSourcesGrid } from '../../components';
import { ModuleActionsList } from '../../components/actions';
import { ModuleOutputsGrid } from '../../components/outputs';

export const ModulePage = () => {
  const { moduleId } = useParams();

  if (!moduleId) return <Navigate to='/404' />;

  return (
    <Flex
      direction='column'
      gap='4'
      css={{
        padding: 12,
      }}
    >
      <ModuleSourcesGrid moduleId={moduleId} />
      <ModuleActionsList moduleId={moduleId} />
      <ModuleOutputsGrid moduleId={moduleId} />
    </Flex>
  );
};

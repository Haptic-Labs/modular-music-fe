import { ModulesQueries } from '../../queries';
import { MODULE_GRID_CONFIG } from '../../constants';
import { ModuleOutputCard } from './module-output-card';
import { AddModuleOutputButton } from './add-module-output-button';
import { SimpleGrid, Title } from '@mantine/core';

type ModuleOutputsGridProps = {
  moduleId: string;
};

export const ModuleOutputsGrid = ({ moduleId }: ModuleOutputsGridProps) => {
  const { data: outputs = [] } = ModulesQueries.useModuleOutputsQuery({
    moduleId,
  });

  return (
    <section>
      <Title order={2} mb='sm'>
        Outputs
      </Title>
      <SimpleGrid cols={MODULE_GRID_CONFIG} spacing='md' mih={70}>
        {outputs.map((output) => (
          <ModuleOutputCard key={output.id} output={output} />
        ))}
        <AddModuleOutputButton moduleId={moduleId} />
      </SimpleGrid>
    </section>
  );
};

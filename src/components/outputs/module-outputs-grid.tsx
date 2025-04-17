import { Grid, Heading } from '@radix-ui/themes';
import { ModulesQueries } from '../../queries';
import { MODULE_GRID_CONFIG } from '../../constants';
import { ModuleOutputCard } from './module-output-card';
import { AddModuleOutputButton } from './add-module-output-button';

type ModuleOutputsGridProps = {
  moduleId: string;
};

export const ModuleOutputsGrid = ({ moduleId }: ModuleOutputsGridProps) => {
  const { data: outputs = [] } = ModulesQueries.useModuleOutputsQuery({
    moduleId,
  });

  // TODO: finish this

  return (
    <section>
      <Heading my='2'>Outputs</Heading>
      <Grid columns={MODULE_GRID_CONFIG} gap='2'>
        {outputs.map((output) => (
          <ModuleOutputCard key={output.id} output={output} />
        ))}
        <AddModuleOutputButton moduleId={moduleId} />
      </Grid>
    </section>
  );
};

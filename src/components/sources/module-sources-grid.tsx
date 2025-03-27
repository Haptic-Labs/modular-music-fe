import { Grid, Heading } from '@radix-ui/themes';
import { ModulesQueries } from '../../queries';
import { ModuleSourceCard } from './module-source-card';
import { AddSourceButton } from './add-source-button';
import { MODULE_GRID_CONFIG } from '../../constants';

type ModuleSourcesGridProps = {
  moduleId: string;
};

export const ModuleSourcesGrid = ({ moduleId }: ModuleSourcesGridProps) => {
  const { data: sources = [] } = ModulesQueries.useModuleSourcesQuery({
    moduleId,
  });

  return (
    <section>
      <Heading my='2'>Sources</Heading>
      <Grid columns={MODULE_GRID_CONFIG} gap='2'>
        {sources.map((source) => (
          <ModuleSourceCard source={source} />
        ))}
        <AddSourceButton moduleId={moduleId} />
      </Grid>
    </section>
  );
};

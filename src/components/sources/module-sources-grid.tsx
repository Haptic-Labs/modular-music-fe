import { ModulesQueries } from '../../queries';
import { ModuleSourceCard } from './module-source-card';
import { EditModuleSourcesButton } from './add-source-button';
import { MODULE_GRID_CONFIG } from '../../constants';
import { convertModuleSourcesToSelectedSources } from '../../utils';
import { SimpleGrid, Title } from '@mantine/core';

type ModuleSourcesGridProps = {
  moduleId: string;
};

export const ModuleSourcesGrid = ({ moduleId }: ModuleSourcesGridProps) => {
  const { data: sources = [] } = ModulesQueries.useModuleSourcesQuery({
    moduleId,
  });
  const recentlyListenedSource = sources.find(
    (source) => source.type === 'RECENTLY_PLAYED',
  );

  const recentlyListenedConfig = ModulesQueries.useRecentlyListenedConfigQuery(
    {
      sourceId: recentlyListenedSource?.id ?? '',
    },
    {
      enabled: !!recentlyListenedSource,
    },
  );

  return (
    <section>
      <Title order={3} my='2'>
        Sources
      </Title>
      <SimpleGrid cols={MODULE_GRID_CONFIG} spacing='md'>
        {sources.map((source) => (
          <ModuleSourceCard key={source.id} source={source} />
        ))}
        <EditModuleSourcesButton
          currentSources={convertModuleSourcesToSelectedSources(
            sources,
            recentlyListenedConfig.data ?? undefined,
          )}
          moduleId={moduleId}
        />
      </SimpleGrid>
    </section>
  );
};

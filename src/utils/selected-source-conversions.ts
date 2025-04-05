import { SelectedSource } from '../components/modals';
import { Database, RecentlyListenedConfig } from '../types';

export const convertSelectedSourcesToModuleSourceInserts = (
  selectedSources: SelectedSource[],
  { moduleId }: { moduleId: string },
): {
  moduleSourceInserts: Database['public']['Tables']['module_sources']['Insert'][];
  recentlyListenedConfig?: RecentlyListenedConfig;
} => {
  return selectedSources.reduce<{
    moduleSourceInserts: Database['public']['Tables']['module_sources']['Insert'][];
    recentlyListenedConfig?: RecentlyListenedConfig;
  }>(
    (acc, curr) => {
      if (curr.source_type === 'RECENTLY_PLAYED') {
        acc.moduleSourceInserts.push({
          spotify_id: curr.spotify_id,
          type: 'RECENTLY_PLAYED',
          module_id: moduleId,
          title: curr.title,
          image_url: curr.image_url,
        });
        acc.recentlyListenedConfig = {
          interval: curr.recently_listened_config!.interval,
          quantity: curr.recently_listened_config!.quantity,
        };
      } else {
        acc.moduleSourceInserts.push({
          spotify_id: curr.spotify_id,
          type: curr.source_type,
          module_id: moduleId,
          title: curr.title,
        });
      }

      return acc;
    },
    { moduleSourceInserts: [] },
  );
};

export const convertModuleSourcesToSelectedSources = (
  moduleSources: Database['public']['Tables']['module_sources']['Row'][],
  recentlyListenedConfig?: Database['public']['Tables']['recently_played_source_configs']['Row'],
): SelectedSource[] => {
  return moduleSources.map(
    (source) =>
      ({
        spotify_id: source.spotify_id ?? undefined,
        source_type: source.type,
        title: source.title,
        recently_listened_config:
          source.type === 'RECENTLY_PLAYED' && recentlyListenedConfig
            ? {
                interval: recentlyListenedConfig.interval,
                quantity: recentlyListenedConfig.quantity,
              }
            : undefined,
      }) as SelectedSource,
  );
};

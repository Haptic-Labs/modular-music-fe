import { useMemo } from 'react';
import { Database } from '../../../types';
import { ActionsQueries, ModulesQueries } from '../../../queries';
import { titleCase } from '../../../utils';

type UseModuleActionDataArgs = {
  actionId: string;
  actionType: Database['public']['Enums']['MODULE_ACTION_TYPE'];
};

type UseModuleActionDataReturn = {
  subtitle?: string;
  sources?: (
    | Database['public']['Tables']['filter_action_sources']['Row']
    | Database['public']['Tables']['combine_action_sources']['Row']
  )[];
  recentlyListenedConfig?: Database['public']['Tables']['recently_played_source_configs']['Row'];
  limitConfig?: Database['public']['Tables']['limit_action_configs']['Row'];
};

export const useModuleActionData = ({
  actionId,
  actionType,
}: UseModuleActionDataArgs) => {
  const shuffleConfig = ActionsQueries.useShuffleConfig(
    {
      actionId,
    },
    {
      enabled: actionType === 'SHUFFLE',
    },
  );

  const filterSources = ModulesQueries.useFilterActionSourcesQuery(
    {
      actionId,
    },
    {
      enabled: actionType === 'FILTER',
    },
  );
  const combineSources = ModulesQueries.useCombineActionSources(
    { actionId },
    {
      enabled: actionType === 'COMBINE',
    },
  );

  const { data: limitConfig } = ModulesQueries.useLimitConfigQuery({
    actionId,
  });

  const sourcesLength =
    filterSources.data?.length ?? combineSources.data?.length;

  const subtitle = useMemo<UseModuleActionDataReturn['subtitle']>(() => {
    switch (actionType) {
      case 'SHUFFLE':
        return shuffleConfig.data?.shuffle_type
          ? titleCase(shuffleConfig.data?.shuffle_type)
          : undefined;
      case 'FILTER':
      case 'COMBINE':
        return `${sourcesLength?.toLocaleString()} source${sourcesLength === 1 ? '' : 's'}`;
      case 'LIMIT':
        return `${limitConfig?.limit.toLocaleString()} items`;
      default:
        return undefined;
    }
  }, [
    actionType,
    shuffleConfig.data?.shuffle_type,
    sourcesLength,
    limitConfig?.limit,
  ]);

  const sources = filterSources.data;

  const recentlyListenedSource = sources?.find(
    (source) => source.source_type === 'RECENTLY_PLAYED',
  );
  const recentlyListenedConfig = ModulesQueries.useRecentlyListenedConfigQuery(
    {
      sourceId: recentlyListenedSource?.id ?? '',
    },
    {
      enabled: !!recentlyListenedSource?.id,
    },
  );

  return {
    subtitle,
    sources: filterSources.data ?? combineSources.data,
    recentlyListenedConfig: recentlyListenedConfig.data,
  };
};

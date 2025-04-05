import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SelectedSource } from '../../components';
import { LimitedMutationOptions } from '../../types';
import { convertSelectedSourcesToModuleSourceInserts } from '../../utils';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import { useAuth } from '../../providers';
import { ModuleSourcesResponse } from './use-module-sources';
import { UseRecentlyListenedConfigResponse } from './use-recently-listened-config';

type UseReplaceModulesSourcesMutationRequest = {
  sources: SelectedSource[];
  moduleId: string;
};

type UseReplaceModulesSourcesMutationResponse = ReturnType<
  typeof convertSelectedSourcesToModuleSourceInserts
>;

export const useReplaceModuleSourcesMutation = <E = unknown, C = unknown>(
  options?: LimitedMutationOptions<
    UseReplaceModulesSourcesMutationResponse,
    E,
    UseReplaceModulesSourcesMutationRequest,
    C
  >,
) => {
  const { supabaseClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    UseReplaceModulesSourcesMutationResponse,
    E,
    UseReplaceModulesSourcesMutationRequest,
    C
  >({
    mutationKey: modulesMutationKeys.replaceModuleSources,
    mutationFn: async (req) => {
      const { moduleSourceInserts, recentlyListenedConfig } =
        convertSelectedSourcesToModuleSourceInserts(req.sources, {
          moduleId: req.moduleId,
        });
      const { data: recentlyListenedSource } = await supabaseClient
        .schema('public')
        .from('module_sources')
        .select('id')
        .eq('module_id', req.moduleId)
        .eq('type', 'RECENTLY_PLAYED')
        .is('deleted_at', null)
        .maybeSingle()
        .throwOnError();
      const { data: originalRecentlyListenedRow } = recentlyListenedSource
        ? await supabaseClient
            .schema('public')
            .from('recently_played_source_configs')
            .select('*')
            .eq('id', recentlyListenedSource.id)
            .is('deleted_at', null)
            .maybeSingle()
            .throwOnError()
        : { data: undefined };

      const { data: originalRows } = await supabaseClient
        .schema('public')
        .from('module_sources')
        .delete()
        .eq('module_id', req.moduleId)
        .select()
        .throwOnError();

      try {
        const { data: newSources } = await supabaseClient
          .schema('public')
          .from('module_sources')
          .insert(moduleSourceInserts)
          .select('*')
          .throwOnError();
        const newRecentlyListenedSourceId = newSources.find(
          (source) => source.type === 'RECENTLY_PLAYED',
        )?.id;
        const { data: newRecentlyListened } =
          recentlyListenedConfig && newRecentlyListenedSourceId
            ? await supabaseClient
                .schema('public')
                .from('recently_played_source_configs')
                .insert([
                  {
                    id: newRecentlyListenedSourceId,
                    ...recentlyListenedConfig,
                  },
                ])
                .select('*')
                .maybeSingle()
                .throwOnError()
            : { data: undefined };

        return {
          moduleSourceInserts: newSources,
          recentlyListenedConfig: newRecentlyListened
            ? {
                interval: newRecentlyListened.interval,
                quantity: newRecentlyListened.quantity,
              }
            : undefined,
        };
      } catch (err) {
        await supabaseClient
          .schema('public')
          .from('module_sources')
          .upsert(originalRows);
        if (originalRecentlyListenedRow)
          await supabaseClient
            .schema('public')
            .from('recently_played_source_configs')
            .upsert([originalRecentlyListenedRow]);

        throw err;
      }
    },
    ...options,
    onSuccess: (res, request, context) => {
      queryClient.setQueriesData<ModuleSourcesResponse>(
        {
          queryKey: modulesQueryKeys.moduleSources({
            moduleId: res.moduleSourceInserts[0]?.module_id ?? request.moduleId,
          }),
          exact: true,
        },
        res.moduleSourceInserts.map((row) => ({
          ...row,
          created_at: row.created_at ?? new Date().toISOString(),
          deleted_at: null,
          id: row.id ?? row.spotify_id ?? '',
          image_url: row.image_url ?? '',
          limit: row.limit ?? null,
          spotify_id: row.spotify_id ?? '',
          updated_at: row.updated_at ?? new Date().toISOString(),
        })),
      );
      const recentlyListenedSource = res.moduleSourceInserts.find(
        (source) => source.type === 'RECENTLY_PLAYED',
      );
      if (recentlyListenedSource?.id && res.recentlyListenedConfig) {
        queryClient.setQueriesData<UseRecentlyListenedConfigResponse>(
          {
            queryKey: modulesQueryKeys.recentlyListenedConfig({
              sourceId: recentlyListenedSource.id,
            }),
            exact: true,
          },
          {
            id: recentlyListenedSource.id,
            created_at: new Date().toISOString(),
            deleted_at: null,
            interval: res.recentlyListenedConfig.interval,
            quantity: res.recentlyListenedConfig.quantity,
            updated_at: new Date().toISOString(),
          },
        );
      } else if (recentlyListenedSource?.id) {
        queryClient.invalidateQueries({
          queryKey: modulesQueryKeys.recentlyListenedConfig({
            sourceId: recentlyListenedSource.id,
          }),
        });
      }

      return options?.onSuccess?.(res, request, context);
    },
  });
};

import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { Database } from '../../types';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import { useAuth } from '../../providers';
import { FilterActionSourcesResponse } from './use-filter-action-sources';
import { useAddRecentlyListenedConfigs } from './use-add-recently-listened_configs';

type UseReplaceModuleFilterSourcesRequest = {
  actionId: string;
  newSources: Database['public']['Tables']['filter_action_sources']['Insert'][];
  recentlyPlayedConfig?: Omit<
    Database['public']['Tables']['recently_played_source_configs']['Insert'],
    'id'
  >;
};

type UseReplaceModuleFilterSourcesResponse = {
  deletedSources: Database['public']['Tables']['filter_action_sources']['Row'][];
  addedSources: Database['public']['Tables']['filter_action_sources']['Row'][];
  newRecentlyPlayedConfig?: Database['public']['Tables']['recently_played_source_configs']['Row'];
};

export const useReplaceModuleFilterSources = <E = unknown>(
  options?: UseMutationOptions<
    UseReplaceModuleFilterSourcesResponse,
    E,
    UseReplaceModuleFilterSourcesRequest
  >,
) => {
  const queryClient = useQueryClient();
  const { supabaseClient } = useAuth();

  const { mutateAsync: addRecentlyListened } = useAddRecentlyListenedConfigs();

  return useMutation<
    UseReplaceModuleFilterSourcesResponse,
    E,
    UseReplaceModuleFilterSourcesRequest
  >({
    mutationKey: modulesMutationKeys.addFilterSources,
    mutationFn: async ({ recentlyPlayedConfig, ...request }) => {
      const hasRecentlyPlayedSource = request.newSources.some(
        (source) => source.source_type === 'RECENTLY_PLAYED',
      );
      if (hasRecentlyPlayedSource && !recentlyPlayedConfig) {
        console.error(
          'Error replacing filter sources due to missing `recentlyPlayedConfig`',
          { request },
        );
        throw new Error(
          'When adding/replacing a source of type recently played, `recentlyPlayedConfig` is required, but none was provided',
        );
      }

      const deletedSources = await supabaseClient
        .schema('public')
        .from('filter_action_sources')
        .delete()
        .eq('action_id', request.actionId)
        .select('*')
        .throwOnError();
      const addedSources = await supabaseClient
        .schema('public')
        .from('filter_action_sources')
        .insert(request.newSources)
        .select('*')
        .throwOnError();
      const newRecentlyPlayedSource = addedSources.data?.find(
        (source) => source.source_type === 'RECENTLY_PLAYED',
      );

      const response: UseReplaceModuleFilterSourcesResponse = {
        addedSources: addedSources.data ?? [],
        deletedSources: deletedSources.data ?? [],
      };

      if (newRecentlyPlayedSource && recentlyPlayedConfig) {
        const { newRecentlyListenedConfigs } = await addRecentlyListened([
          { ...recentlyPlayedConfig, id: newRecentlyPlayedSource.id },
        ]);
        if (newRecentlyListenedConfigs.length) {
          response.newRecentlyPlayedConfig = newRecentlyListenedConfigs[0];
        }
      }

      return response;
    },
    ...options,
    onMutate: (request, ...rest) => {
      queryClient.setQueriesData<FilterActionSourcesResponse>(
        {
          queryKey: modulesQueryKeys.filterActionSources({
            actionId: request.actionId,
          }),
          exact: true,
        },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.concat(
            request.newSources.map<(typeof oldData)[number]>((source) => ({
              action_id: source.action_id,
              created_at: source.created_at || new Date().toISOString(),
              deleted_at: source.deleted_at || null,
              updated_at: source.updated_at || new Date().toISOString(),
              id: source.id || '',
              image_url: source.image_url || '',
              limit: source.limit || null,
              spotify_id: source.spotify_id || null,
              source_type: source.source_type || '',
              title: source.title || null,
            })),
          );
        },
      );

      return options?.onMutate?.(request, ...rest);
    },
    onSuccess: (response, request, ...rest) => {
      queryClient.setQueriesData<FilterActionSourcesResponse>(
        {
          queryKey: modulesQueryKeys.filterActionSources({
            actionId: request.actionId,
          }),
          exact: true,
        },
        (oldData) => {
          if (!oldData) return oldData;
          const { successfulRequestSources, failedRequestSources } =
            request.newSources.reduce<{
              successfulRequestSources: {
                requestSource: (typeof request.newSources)[number];
                successfulSource: (typeof response.addedSources)[number];
              }[];
              failedRequestSources: typeof request.newSources;
            }>(
              (acc, requestSource) => {
                const successfulSource = response.addedSources.find(
                  (source) =>
                    source.spotify_id === requestSource.spotify_id &&
                    source.source_type === requestSource.spotify_id,
                );
                if (successfulSource) {
                  acc.successfulRequestSources.push({
                    requestSource,
                    successfulSource,
                  });
                } else {
                  acc.failedRequestSources.push(requestSource);
                }
                return acc;
              },
              {
                successfulRequestSources: [],
                failedRequestSources: [],
              },
            );

          return oldData
            .map(
              (oldSource) =>
                successfulRequestSources.find(
                  ({ requestSource }) =>
                    oldSource.spotify_id === requestSource.spotify_id &&
                    oldSource.source_type === requestSource.spotify_id,
                )?.successfulSource ?? oldSource,
            )
            .filter(
              (oldSource) =>
                !failedRequestSources.some(
                  (failedSource) =>
                    failedSource.spotify_id === oldSource.spotify_id &&
                    failedSource.source_type === oldSource.source_type,
                ),
            );
        },
      );

      return options?.onSuccess?.(response, request, ...rest);
    },
    onError: (err, request, ...rest) => {
      queryClient.setQueriesData<FilterActionSourcesResponse>(
        {
          queryKey: modulesQueryKeys.filterActionSources({
            actionId: request.actionId,
          }),
          exact: true,
        },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter(
            (oldSource) =>
              !request.newSources.some(
                (source) =>
                  source.spotify_id === oldSource.spotify_id &&
                  source.source_type === oldSource.source_type,
              ),
          );
        },
      );

      return options?.onError?.(err, request, ...rest);
    },
  });
};

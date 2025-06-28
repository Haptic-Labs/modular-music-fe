import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { Database } from '../../types';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import { useAuth } from '../../providers';
import { FilterActionSourcesResponse } from './use-filter-action-sources';

type UseAddModuleFilterSourcesRequest = {
  actionId: string;
  sources: Database['public']['Tables']['filter_action_sources']['Insert'][];
};

type UseAddModuleFilterSourcesResponse = {
  addedSources: Database['public']['Tables']['filter_action_sources']['Row'][];
};

export const useAddModuleFilterSources = <E = unknown>(
  options?: UseMutationOptions<
    UseAddModuleFilterSourcesResponse,
    E,
    UseAddModuleFilterSourcesRequest
  >,
) => {
  const queryClient = useQueryClient();
  const { supabaseClient } = useAuth();
  return useMutation<
    UseAddModuleFilterSourcesResponse,
    E,
    UseAddModuleFilterSourcesRequest
  >({
    mutationKey: modulesMutationKeys.addFilterSources,
    mutationFn: async (request) => {
      const response = await supabaseClient
        .schema('public')
        .from('filter_action_sources')
        .insert(request.sources)
        .select('*')
        .throwOnError();

      return { addedSources: response.data ?? [] };
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
            request.sources.map<(typeof oldData)[number]>((source) => ({
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
            request.sources.reduce<{
              successfulRequestSources: {
                requestSource: (typeof request.sources)[number];
                successfulSource: (typeof response.addedSources)[number];
              }[];
              failedRequestSources: typeof request.sources;
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
              !request.sources.some(
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

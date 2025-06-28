import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { Database } from '../../types';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import { useAuth } from '../../providers';
import { useAddRecentlyListenedConfigs } from './use-add-recently-listened_configs';
import { FilterActionSourcesResponse } from './use-filter-action-sources';
import { CombineActionSourcesResponse } from './use-combine-action-sources';

type UseReplaceModuleActionSourcesRequest<
  T extends Database['public']['Enums']['MODULE_ACTION_TYPE'],
> = {
  actionId: string;
  actionType: T;
  newSources: Database['public']['Tables'][T extends 'FILTER'
    ? 'filter_action_sources'
    : 'combine_action_sources']['Insert'][];
  recentlyPlayedConfig?: Omit<
    Database['public']['Tables']['recently_played_source_configs']['Insert'],
    'id'
  >;
};

type UseReplaceModuleActionSourcesResponse = {
  deletedSources: Database['public']['Tables']['filter_action_sources']['Row'][];
  addedSources: Database['public']['Tables']['filter_action_sources']['Row'][];
  newRecentlyPlayedConfig?: Database['public']['Tables']['recently_played_source_configs']['Row'];
};

export const useReplaceModuleFilterSources = <
  T extends Database['public']['Enums']['MODULE_ACTION_TYPE'],
  E = unknown,
  C = unknown,
>(
  options: UseMutationOptions<
    UseReplaceModuleActionSourcesResponse,
    E,
    UseReplaceModuleActionSourcesRequest<T>,
    C
  > = {},
) => {
  const queryClient = useQueryClient();
  const { supabaseClient } = useAuth();

  const { mutateAsync: addRecentlyListened } = useAddRecentlyListenedConfigs();

  return useMutation<
    UseReplaceModuleActionSourcesResponse,
    E,
    UseReplaceModuleActionSourcesRequest<T>,
    { externalContext: C; internalContext: { revert: () => void } }
  >({
    mutationKey: modulesMutationKeys.addFilterSources,
    mutationFn: async ({ recentlyPlayedConfig, actionType, ...request }) => {
      const hasRecentlyPlayedSource = request.newSources.some(
        (source) => source.source_type === 'RECENTLY_PLAYED',
      );
      if (hasRecentlyPlayedSource && !recentlyPlayedConfig) {
        console.error(
          'Error replacing action sources due to missing `recentlyPlayedConfig`',
          { request },
        );
        throw new Error(
          'When adding/replacing a source of type recently played, `recentlyPlayedConfig` is required, but none was provided',
        );
      }

      const deletedSources = await supabaseClient
        .schema('public')
        .from(
          actionType === 'FILTER'
            ? 'filter_action_sources'
            : 'combine_action_sources',
        )
        .delete()
        .eq('action_id', request.actionId)
        .select('*')
        .throwOnError();
      const addedSources = await supabaseClient
        .schema('public')
        .from(
          actionType === 'FILTER'
            ? 'filter_action_sources'
            : 'combine_action_sources',
        )
        .insert(
          request.newSources.map((source) => {
            if (source.id) {
              return source;
            }
            const {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              id,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              created_at,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              deleted_at,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              updated_at,
              ...minimalSourceInsert
            } = source;
            return minimalSourceInsert;
          }),
        )
        .select('*')
        .throwOnError();
      const newRecentlyPlayedSource = addedSources.data?.find(
        (source) => source.source_type === 'RECENTLY_PLAYED',
      );

      const response: UseReplaceModuleActionSourcesResponse = {
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
    onMutate: async (request, ...rest) => {
      const previousDatas: {
        data: T extends 'FILTER'
          ? FilterActionSourcesResponse
          : CombineActionSourcesResponse;
        queryKey: QueryKey;
      }[] = [];
      queryClient.setQueriesData<FilterActionSourcesResponse>(
        {
          queryKey: modulesQueryKeys[
            request.actionType === 'FILTER'
              ? 'filterActionSources'
              : 'combineActionSources'
          ]({
            actionId: request.actionId,
          }),
          exact: true,
          predicate: ({ queryKey, state }) => {
            if (state.data)
              previousDatas.push({
                data: state.data as T extends 'FILTER'
                  ? FilterActionSourcesResponse
                  : CombineActionSourcesResponse,
                queryKey,
              });
            return true;
          },
        },
        (oldData) => {
          if (!oldData) return oldData;
          return request.newSources.map<(typeof oldData)[number]>((source) => ({
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
          }));
        },
      );

      return {
        externalContext: (await options?.onMutate?.(
          request,
          ...rest,
        )) as unknown as C,
        internalContext: {
          revert: () => {
            previousDatas.forEach(({ data, queryKey }) => {
              queryClient.setQueryData(queryKey, data);
            });
          },
        },
      };
    },
    onSuccess: (response, request, { externalContext }) => {
      queryClient.setQueriesData<FilterActionSourcesResponse>(
        {
          queryKey: modulesQueryKeys[
            request.actionType === 'FILTER'
              ? 'filterActionSources'
              : 'combineActionSources'
          ]({
            actionId: request.actionId,
          }),
          exact: true,
        },
        (oldData) => {
          if (!oldData) return oldData;

          return response.addedSources;
        },
      );

      return options?.onSuccess?.(response, request, externalContext);
    },
    onError: (err, request, context) => {
      context?.internalContext.revert();
      return options?.onError?.(err, request, context?.externalContext);
    },
    onSettled: (response, err, request, context) => {
      return options?.onSettled?.(
        response,
        err,
        request,
        context?.externalContext,
      );
    },
  });
};

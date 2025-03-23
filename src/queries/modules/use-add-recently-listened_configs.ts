import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Database } from '../../types';
import { useAuth } from '../../providers';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import {
  UseMultipleRecentlyListenedConfigsRequest,
  UseMultipleRecentlyListenedConfigsResponse,
  UseRecentlyListenedConfigResponse,
} from './use-recently-listened-config';

type UseAddRecentlyListenedConfigsRequest =
  Database['public']['Tables']['recently_played_source_configs']['Insert'][];

type UseAddRecentlyListenedConfigsResponse = {
  newRecentlyListenedConfigs: Database['public']['Tables']['recently_played_source_configs']['Row'][];
};

export const useAddRecentlyListenedConfigs = <E = unknown>(
  options?: UseMutationOptions<
    UseAddRecentlyListenedConfigsResponse,
    E,
    UseAddRecentlyListenedConfigsRequest
  >,
) => {
  const { supabaseClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: modulesMutationKeys.addRecentlyListenedConfigs,
    mutationFn: async (rows) => {
      const response = await supabaseClient
        .schema('public')
        .from('recently_played_source_configs')
        .upsert(rows, { onConflict: 'id' })
        .select('*')
        .throwOnError();

      if (!response.data)
        throw new Error('No recently_played_source_configs insert response');

      return {
        newRecentlyListenedConfigs: response.data,
      };
    },
    ...options,
    onSuccess: (response, request, ...rest) => {
      response.newRecentlyListenedConfigs.forEach((newRow) => {
        queryClient.setQueryData<UseRecentlyListenedConfigResponse>(
          modulesQueryKeys.recentlyListenedConfig({
            sourceId: newRow.id,
          }),
          newRow,
        );
      });

      queryClient.setQueriesData<UseMultipleRecentlyListenedConfigsResponse>(
        {
          queryKey: modulesQueryKeys.multipleRecentlyListenedConfigs(),
          exact: false,
          predicate: ({ queryKey }) => {
            const typedKey = queryKey as ReturnType<
              typeof modulesQueryKeys.multipleRecentlyListenedConfigs
            >;
            const queryRequest = typedKey[1] as
              | UseMultipleRecentlyListenedConfigsRequest
              | undefined;
            if (!queryRequest) return false;
            return response.newRecentlyListenedConfigs.some((newRow) =>
              queryRequest.sourceIds.includes(newRow.id),
            );
          },
        },
        (oldData) => {
          if (!oldData) return oldData;

          const matchedRowIds: string[] = [];
          const result = oldData.map((row) => {
            const matchingRow = response.newRecentlyListenedConfigs.find(
              (newRow) => newRow.id === row.id,
            );
            if (matchingRow) matchedRowIds.push(matchingRow.id);
            return matchingRow ?? row;
          });
          const unmatchedRows = response.newRecentlyListenedConfigs.filter(
            (row) => !matchedRowIds.includes(row.id),
          );

          return result.concat(unmatchedRows);
        },
      );

      return options?.onSuccess?.(response, request, ...rest);
    },
  });
};

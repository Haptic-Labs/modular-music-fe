import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../providers';
import { Database, LimitedMutationOptions, WrappedContext } from '../../types';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import { UseModuleOutputsQueryResponse } from './use-module-outputs';

export type UseRemoveModuleOutputMutationRequest = {
  outputId: string;
  moduleId?: string;
};

export type UseRemoveModuleOutputMutationResponse =
  | Database['public']['Tables']['module_outputs']['Row']
  | null;

export const useRemoveModuleOutputMutation = <E = unknown, C = unknown>(
  options?: LimitedMutationOptions<
    UseRemoveModuleOutputMutationResponse,
    E,
    UseRemoveModuleOutputMutationRequest,
    C
  >,
) => {
  const { supabaseClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    UseRemoveModuleOutputMutationResponse,
    E,
    UseRemoveModuleOutputMutationRequest,
    WrappedContext<C>
  >({
    mutationKey: modulesMutationKeys.removeModuleOutput,
    mutationFn: async (request) => {
      const res = await supabaseClient
        .schema('public')
        .from('module_outputs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', request.outputId)
        .select('*')
        .maybeSingle()
        .throwOnError();

      if (!res.data) throw new Error('No data returned from mutation');
      return res.data;
    },
    ...options,
    onMutate: (request) => {
      const originalQueryData: [QueryKey, UseModuleOutputsQueryResponse] = [];
      if (request.moduleId) {
        queryClient.setQueriesData<UseModuleOutputsQueryResponse>(
          {
            queryKey: modulesQueryKeys.moduleOutputs({
              moduleId: request.moduleId,
            }),
            exact: true,
            predicate: ({ queryKey, state: { data } }) => {
              if (data) originalQueryData.push([queryKey, data]);
              return true;
            },
          },
          (oldData) => {
            if (!oldData) return oldData;

            return oldData.filter((output) => output.id !== request.outputId);
          },
        );
      }

      return {
        internalContext: {
          revert: () => {
            originalQueryData.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
            });
          },
        },
      };
    },
  });
};

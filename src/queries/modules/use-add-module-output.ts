import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../providers';
import { Database, LimitedMutationOptions } from '../../types';
import { UseModuleOutputsQueryResponse } from './use-module-outputs';
import { modulesMutationKeys, modulesQueryKeys } from './keys';

type Context<C> = {
  internalContext: {
    revert: () => void;
  };
  externalContext: C;
};

export type AddModuleOutputMutationRequest =
  Database['public']['Tables']['module_outputs']['Insert'];

export type AddModuleOutputMutationResponse =
  Database['public']['Tables']['module_outputs']['Row'];

export const useAddModuleOutputMutation = <E = unknown, C = unknown>(
  options?: LimitedMutationOptions<
    AddModuleOutputMutationResponse,
    E,
    AddModuleOutputMutationRequest,
    C
  >,
) => {
  const { supabaseClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    AddModuleOutputMutationResponse,
    E,
    AddModuleOutputMutationRequest,
    Context<C>
  >({
    mutationKey: modulesMutationKeys.addModuleOutput,
    mutationFn: async (request) => {
      const res = await supabaseClient
        .schema('public')
        .from('module_outputs')
        .insert(request)
        .select('*')
        .single()
        .throwOnError();

      if (!res.data) throw new Error('Failed to add module output');

      return res.data;
    },
    ...options,
    onMutate: async (request, ...rest) => {
      const originalQueries: [QueryKey, UseModuleOutputsQueryResponse][] = [];

      queryClient.setQueriesData<UseModuleOutputsQueryResponse>(
        {
          queryKey: modulesQueryKeys.moduleOutputs({
            moduleId: request.module_id,
          }),
          exact: true,
          predicate: ({ queryKey, state: { data } }) => {
            if (data) originalQueries.push([queryKey, data]);
            return true;
          },
        },
        (oldData) => {
          if (!oldData) return oldData;

          const newRow: AddModuleOutputMutationResponse = {
            ...request,
            created_at: request.created_at || new Date().toISOString(),
            deleted_at: null,
            id: request.id ?? '',
            limit: request.limit ?? null,
            updated_at: request.updated_at || new Date().toISOString(),
          };

          return [...oldData, newRow];
        },
      );

      return {
        internalContext: {
          revert: () => {
            originalQueries.forEach(([queryKey, originalData]) => {
              queryClient.setQueryData<UseModuleOutputsQueryResponse>(
                queryKey,
                originalData,
              );
            });
          },
        },
        externalContext: (await options?.onMutate?.(request, ...rest)) as C,
      };
    },
    onSuccess: (response, request, { externalContext }) => {
      queryClient.setQueriesData<UseModuleOutputsQueryResponse>(
        {
          queryKey: modulesQueryKeys.moduleOutputs({
            moduleId: request.module_id,
          }),
          exact: true,
        },
        (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((row) =>
            row.id === (request.id ?? '') && row.spotify_id === response.id
              ? response
              : row,
          );
        },
      );

      return options?.onSuccess?.(response, request, externalContext);
    },
    onError: (error, request, context) => {
      context?.internalContext?.revert?.();
      return options?.onError?.(error, request, context?.externalContext);
    },
    onSettled: (response, error, request, context) => {
      return options?.onSettled?.(
        response,
        error,
        request,
        context?.externalContext,
      );
    },
  });
};

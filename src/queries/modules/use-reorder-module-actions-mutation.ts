import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '../../providers';
import { Database } from '../../types';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import { ModuleActionsResponse } from './use-module-actions';

type UseReorderModuleActionsMutationsRequest =
  Database['public']['Functions']['ReorderActions']['Args'];
type UseReorderModuleActionsMutationsResponse =
  Database['public']['Functions']['ReorderActions']['Returns'];

type Context<C> = {
  internalContext: {
    revert: () => void;
  };
  externalContext: C;
};

export const useReorderModuleActionsMutation = <E = unknown, C = unknown>(
  moduleId: string,
  options?: UseMutationOptions<
    UseReorderModuleActionsMutationsResponse,
    E,
    UseReorderModuleActionsMutationsRequest,
    C
  >,
) => {
  const { supabaseClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    UseReorderModuleActionsMutationsResponse,
    E,
    UseReorderModuleActionsMutationsRequest,
    Context<C>
  >({
    mutationKey: modulesMutationKeys.reorderModuleActions,
    mutationFn: async (request) => {
      const res = await supabaseClient
        .schema('public')
        .rpc('ReorderActions', request)
        .throwOnError();

      if (!res.data)
        throw new Error('No data returned from reorder actions mutation');

      return res.data;
    },
    ...options,
    onMutate: async (request, ...rest) => {
      const originalQueries: [QueryKey, ModuleActionsResponse][] = [];
      queryClient.setQueriesData<ModuleActionsResponse>(
        {
          queryKey: modulesQueryKeys.moduleActions({ moduleId }),
          exact: true,
          predicate: ({ queryKey, state }) => {
            if (state.data) {
              originalQueries.push([queryKey, state.data]);
            }
            return true;
          },
        },
        (oldData) => {
          if (!oldData) return oldData;

          return request.action_ids.reduce<ModuleActionsResponse>(
            (acc, actionId) => {
              const matchingAction = oldData.find(
                (action) => actionId === action.id,
              );
              if (matchingAction) {
                acc.push(matchingAction);
              }
              return acc;
            },
            [],
          );
        },
      );

      return {
        internalContext: {
          revert: () => {
            originalQueries.forEach(([queryKey, originalData]) => {
              queryClient.setQueryData<ModuleActionsResponse>(
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
      const newOrder = [...response].sort((a, b) => a.order - b.order);
      queryClient.setQueriesData<ModuleActionsResponse>(
        {
          queryKey: modulesQueryKeys.moduleActions({ moduleId }),
          exact: true,
        },
        newOrder,
      );
      return options?.onSuccess?.(response, request, externalContext);
    },
    onError: (error, request, context) => {
      context?.internalContext?.revert();
      return options?.onError?.(error, request, context?.externalContext);
    },
    onSettled: (data, error, request, context) => {
      return options?.onSettled?.(
        data,
        error,
        request,
        context?.externalContext,
      );
    },
  });
};

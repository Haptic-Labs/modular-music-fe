import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { Database } from '../../types';
import { useAuth } from '../../providers';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import { UserModulesResponse } from './use-user-modules';

type UseAddModuleMutationRequest =
  Database['public']['Tables']['modules']['Insert'];

type UseAddModuleMutationResponse =
  Database['public']['Tables']['modules']['Row'];

export const useAddModuleMutation = <E = unknown>(
  options?: UseMutationOptions<
    UseAddModuleMutationResponse,
    E,
    UseAddModuleMutationRequest
  >,
) => {
  const { supabaseClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: modulesMutationKeys.addModule,
    mutationFn: async (request) => {
      const response = await supabaseClient
        .schema('public')
        .from('modules')
        .insert(request)
        .select('*')
        .single()
        .throwOnError();

      if (!response.data) throw new Error('No data returned');

      return response.data;
    },
    ...options,
    onMutate: (request, ...rest) => {
      queryClient.setQueriesData<UserModulesResponse>(
        {
          queryKey: modulesQueryKeys.userModules({ userId: request.user_id }),
          exact: true,
        },
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.concat([
            {
              created_at: request.created_at ?? new Date().toISOString(),
              deleted_at: null,
              user_id: request.user_id,
              id: request.id ?? '',
              is_running: request.is_running ?? false,
              name: request.name,
              updated_at: request.updated_at ?? new Date().toISOString(),
              schedule_config: null,
              previous_run: null,
            },
          ]);
        },
      );

      return options?.onMutate?.(request, ...rest);
    },
    onSuccess: (response, request, ...rest) => {
      queryClient.setQueriesData<UserModulesResponse>(
        {
          queryKey: modulesQueryKeys.userModules({ userId: request.user_id }),
          exact: true,
        },
        (oldData) => {
          if (!oldData) return oldData;

          const hasOptimisticUpdate = oldData.some(
            (module) => module.id === (request.id ?? ''),
          );

          if (hasOptimisticUpdate) {
            return oldData.map((module) =>
              module.id === (request.id ?? '') ? response : module,
            );
          }

          return oldData.concat([response]);
        },
      );

      return options?.onSuccess?.(response, request, ...rest);
    },
    onError: (error, request, ...rest) => {
      queryClient.setQueriesData<UserModulesResponse>(
        {
          queryKey: modulesQueryKeys.userModules({ userId: request.user_id }),
          exact: true,
        },
        (oldData) => {
          if (!oldData) return oldData;

          return oldData.filter((module) => module.id !== (request.id ?? ''));
        },
      );

      return options?.onError?.(error, request, ...rest);
    },
  });
};

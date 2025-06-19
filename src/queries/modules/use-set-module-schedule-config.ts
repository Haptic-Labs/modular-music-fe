import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../providers';
import { Database, LimitedMutationOptions } from '../../types';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import { UserModulesResponse } from './use-user-modules';

export type UseSetModuleScheduleConfigMutationRequest = {
  moduleId: string;
  config?: Database['public']['CompositeTypes']['ModuleScheduleConfig'];
};

export type UseSetModuleScheduleConfigMutationResponse =
  Database['public']['Tables']['modules']['Row'];

export const useSetModuleScheduleConfig = <E = unknown, C = unknown>(
  options?: LimitedMutationOptions<
    UseSetModuleScheduleConfigMutationResponse,
    E,
    UseSetModuleScheduleConfigMutationRequest,
    C
  >,
) => {
  const queryClient = useQueryClient();
  const { supabaseClient, user } = useAuth();

  return useMutation({
    mutationKey: modulesMutationKeys.setModuleScheduleConfig,
    mutationFn: async (req) => {
      const query = supabaseClient
        .schema('public')
        .from('modules')
        .update({
          schedule_config: req.config || null,
        })
        .eq('id', req.moduleId)
        .select('*')
        .single()
        .throwOnError();

      const { data: res } = await query;

      if (!res) throw new Error('Error setting module schedule config');

      return res;
    },
    ...options,
    onSuccess: (res, req, ...rest) => {
      if (user?.id) {
        queryClient.setQueriesData<UserModulesResponse>(
          {
            queryKey: modulesQueryKeys.userModules({ userId: user?.id ?? '' }),
            exact: true,
          },
          (oldData) => {
            if (!oldData) return oldData;

            return oldData.map((module) =>
              module.id === res.id ? res : module,
            );
          },
        );
      }

      return options?.onSuccess?.(res, req, ...rest);
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../providers';
import { Database, LimitedMutationOptions } from '../../types';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import { ScheduleConfig } from '../../components/popovers';
import { UserModulesResponse } from './use-user-modules';

const convertReqToColValues = (
  req: UseSetModuleScheduleConfigMutationRequest,
): Pick<
  Database['public']['Tables']['modules']['Update'],
  'next_scheduled_run' | 'schedule_config'
> => {
  if (!req.config) {
    return {
      next_scheduled_run: null,
      schedule_config: null,
    };
  }

  return {
    next_scheduled_run: req.config.nextScheduledRun,
    schedule_config: req.config.repeatConfig.enabled
      ? {
          quantity: req.config.repeatConfig.quantity,
          interval: req.config.repeatConfig.interval,
        }
      : null,
  };
};

export type UseSetModuleScheduleConfigMutationRequest = {
  moduleId: string;
  config?: ScheduleConfig;
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
        .update(convertReqToColValues(req))
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

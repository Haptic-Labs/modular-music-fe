import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../providers';
import { Database, LimitedMutationOptions } from '../../types';
import { modulesMutationKeys, modulesQueryKeys } from './keys';
import { UserModulesResponse } from './use-user-modules';

export type UseSetModuleScheduleConfigMutationRequest = {
  moduleId: string;
  config?: Database['public']['CompositeTypes']['ModuleScheduleConfig'];
};

export type UseSetModuleScheduleConfigMutationResponse = null | Pick<
  Database['public']['Tables']['modules']['Row'],
  'schedule_config' | 'next_run'
>;

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
      const query = supabaseClient.functions.invoke(
        `modules/${req.moduleId}/schedule`,
        {
          body: {
            next_run: req.config?.nextScheduledRun,
            schedule_config: {
              quantity: req.config?.repeatConfig.quantity,
              interval: req.config?.repeatConfig.interval,
            },
          },
        },
      );

      const { data: res } = await query;

      if (req.config?.repeatConfig && !res)
        throw new Error('Error setting module schedule config');

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

            // TODO: fix delete not updating, and slow update on schedule

            return oldData.map<(typeof oldData)[number]>((module) =>
              module.id === req.moduleId
                ? {
                    ...module,
                    next_run: res?.next_run ?? null,
                    schedule_config: res?.schedule_config
                      ? {
                          quantity: res.schedule_config.quantity,
                          interval: res.schedule_config.interval,
                        }
                      : null,
                  }
                : module,
            );
          },
        );
      }

      return options?.onSuccess?.(res, req, ...rest);
    },
    onSettled: (res, error, req, context) => {
      console.log('brayden-test', { res, error, req, context });
      return options?.onSettled?.(res, error, req, context);
    },
  });
};

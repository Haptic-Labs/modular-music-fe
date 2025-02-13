import { useQuery } from '@tanstack/react-query';
import { Database, LimitedQueryOptions } from '../../types';
import { actionQueryKeys } from './keys';
import { useAuth } from '../../providers';

export type UseShuffleConfigRequest = {
  actionId: string;
};

export type UseShuffleConfigResponse =
  Database['public']['Tables']['shuffle_action_configs']['Row'];

export const useShuffleConfig = <E = unknown, D = UseShuffleConfigResponse>(
  req: UseShuffleConfigRequest,
  options?: LimitedQueryOptions<UseShuffleConfigResponse, E, D>,
) => {
  const { supabaseClient } = useAuth();

  return useQuery({
    queryKey: actionQueryKeys.shuffleConfig(req),
    queryFn: async () => {
      const query = supabaseClient
        .schema('public')
        .from('shuffle_action_configs')
        .select()
        .eq('id', req.actionId)
        .maybeSingle()
        .throwOnError();

      const { data: res } = await query;

      if (!res)
        throw new Error(
          `Error fetching shuffe config for action: ${req.actionId}`,
        );

      return res;
    },
    ...options,
  });
};

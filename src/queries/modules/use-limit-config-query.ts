import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../providers';
import { Database, LimitedQueryOptions } from '../../types';
import { modulesQueryKeys } from './keys';

export type UseLimitConfigQueryRequest = {
  actionId: string;
};

export type UseLimitConfigQueryResponse =
  | Database['public']['Tables']['limit_action_configs']['Row']
  | null;

export const useLimitConfigQuery = <
  E = unknown,
  D = UseLimitConfigQueryResponse,
>(
  request: UseLimitConfigQueryRequest,
  options?: LimitedQueryOptions<UseLimitConfigQueryResponse, E, D>,
) => {
  const { supabaseClient } = useAuth();

  return useQuery({
    queryKey: modulesQueryKeys.limitConfig(request),
    queryFn: async () => {
      const query = supabaseClient
        .schema('public')
        .from('limit_action_configs')
        .select('*')
        .eq('id', request.actionId)
        .is('deleted_at', null)
        .throwOnError()
        .maybeSingle();

      const { data: res } = await query;

      return res;
    },
    ...options,
  });
};

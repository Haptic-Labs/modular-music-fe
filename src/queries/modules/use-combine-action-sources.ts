import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../providers';
import { Database, LimitedQueryOptions } from '../../types';
import { modulesQueryKeys } from './keys';

export type CombineActionSourcesRequest = {
  actionId: string;
};

export type CombineActionSourcesResponse =
  Database['public']['Tables']['combine_action_sources']['Row'][];

export const useCombineActionSources = <
  E = unknown,
  D = CombineActionSourcesResponse,
>(
  request: CombineActionSourcesRequest,
  options?: LimitedQueryOptions<CombineActionSourcesResponse, E, D>,
) => {
  const { supabaseClient } = useAuth();

  return useQuery({
    queryKey: modulesQueryKeys.combineActionSources(request),
    queryFn: async () => {
      const query = supabaseClient
        .schema('public')
        .from('combine_action_sources')
        .select('*')
        .eq('action_id', request.actionId)
        .is('deleted_at', null)
        .throwOnError();

      const { data } = await query;

      if (!data) throw new Error('Error fetching combine action sources');

      return data;
    },
    ...options,
  });
};

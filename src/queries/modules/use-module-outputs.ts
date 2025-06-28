import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../providers';
import { Database, LimitedQueryOptions } from '../../types';
import { modulesQueryKeys } from './keys';

export type UseModuleOutputsQueryRequest = {
  moduleId: string;
};

export type UseModuleOutputsQueryResponse =
  Database['public']['Tables']['module_outputs']['Row'][];

export const useModuleOutputsQuery = <
  E = unknown,
  D = UseModuleOutputsQueryResponse,
>(
  request: UseModuleOutputsQueryRequest,
  options?: LimitedQueryOptions<UseModuleOutputsQueryResponse, E, D>,
) => {
  const { supabaseClient } = useAuth();

  return useQuery({
    queryKey: modulesQueryKeys.moduleOutputs(request),
    queryFn: async () => {
      const res = await supabaseClient
        .schema('public')
        .from('module_outputs')
        .select('*')
        .eq('module_id', request.moduleId)
        .is('deleted_at', null)
        .throwOnError();

      if (!res.data) throw new Error('No data returned from query');
      return res.data;
    },
    ...options,
  });
};

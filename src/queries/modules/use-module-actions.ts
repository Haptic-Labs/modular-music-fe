import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../providers';
import { Database, LimitedQueryOptions } from '../../types';
import { ModuleSourcesRequest } from './use-module-sources';
import { modulesQueryKeys } from './keys';

export type ModuleActionsRequest = {
  moduleId: string;
};

export type ModuleActionsResponse =
  Database['public']['Tables']['module_actions']['Row'][];

export const useModuleActionsQuery = <E = unknown, D = ModuleActionsResponse>(
  request: ModuleSourcesRequest,
  options?: LimitedQueryOptions<ModuleActionsResponse, E, D>,
) => {
  const { supabaseClient } = useAuth();
  return useQuery({
    queryKey: modulesQueryKeys.moduleActions(request),
    queryFn: async () => {
      const query = supabaseClient
        .schema('public')
        .from('module_actions')
        .select('*')
        .order('order', { ascending: true })
        .eq('module_id', request.moduleId)
        .is('deleted_at', null)
        .throwOnError();

      const { data: res } = await query;

      return res ?? [];
    },
    ...options,
  });
};

import { useQuery } from '@tanstack/react-query';
import { Database, LimitedQueryOptions } from '../../types';
import { modulesQueryKeys } from './keys';
import { useAuth } from '../../providers';

export type UserModulesRequest = {
  userId: string;
  includeDeleted?: boolean;
};

export type UserModulesResponse =
  Database['public']['Tables']['modules']['Row'][];

export const useUserModulesQuery = <E = unknown, D = UserModulesResponse>(
  request: UserModulesRequest,
  options?: LimitedQueryOptions<UserModulesResponse, E, D>,
) => {
  const { supabaseClient } = useAuth();
  return useQuery({
    queryKey: modulesQueryKeys.userModules(request),
    queryFn: async () => {
      const query = supabaseClient
        .schema('public')
        .from('modules')
        .select('*')
        .eq('user_id', request.userId)
        .throwOnError();
      if (!request.includeDeleted) {
        query.is('deleted_at', null);
      }
      const { data: res } = await query;

      return res ?? [];
    },
    ...options,
  });
};

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../providers';
import { Database } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { modulesQueryKeys, UserModulesResponse } from '../queries/modules';

type UserModulesPayloadType<
  Operation extends 'INSERT' | 'UPDATE' | 'DELETE',
  Schema extends keyof Database,
> = {
  type: 'broadcast';
  event: Operation;
  payload: {
    id: string;
    operation: Operation;
    schema: Schema;
    table: keyof Database[Schema]['Tables'];
  } & (Operation extends 'INSERT'
    ? {
        record: Database['public']['Tables']['modules']['Row'];
      }
    : Operation extends 'UPDATE'
      ? {
          old_record: Database['public']['Tables']['modules']['Row'];
          record: Database['public']['Tables']['modules']['Row'];
        }
      : Operation extends 'DELETE'
        ? {
            old_record: Database['public']['Tables']['modules']['Row'];
          }
        : undefined);
};

export const useModulesRunningListener = () => {
  const { supabaseClient, user } = useAuth();
  const [hasSetAuth, setHasSetAuth] = useState(false);
  const queryClient = useQueryClient();

  const updateModule = <Operation extends 'INSERT' | 'UPDATE' | 'DELETE'>(
    operation: Operation,
    payload: UserModulesPayloadType<Operation, 'public'>['payload'],
  ) => {
    if (!user) return;

    queryClient.setQueriesData(
      {
        queryKey: modulesQueryKeys.userModules({ userId: user.id }),
        exact: false,
        predicate: ({ queryKey }) => {
          const typedKey = queryKey as ReturnType<
            typeof modulesQueryKeys.userModules
          >;
          const request = typedKey[1] as Exclude<
            (typeof typedKey)[1],
            string | undefined
          >;
          if (request.includeDeleted) {
            return false;
          }
          return true;
        },
      },
      (oldData) => {
        const typedOldData = oldData as UserModulesResponse;
        switch (operation) {
          case 'INSERT': {
            const typedPayload = payload as UserModulesPayloadType<
              'INSERT',
              'public'
            >['payload'];
            return [...(typedOldData ?? []), typedPayload.record];
          }
          case 'UPDATE': {
            const typedPayload = payload as UserModulesPayloadType<
              'UPDATE',
              'public'
            >['payload'];
            return (
              typedOldData
                ?.map((module) =>
                  module.id === typedPayload.old_record.id
                    ? typedPayload.record
                    : module,
                )
                .filter(Boolean) ?? [typedPayload.record].filter(Boolean)
            );
          }
          case 'DELETE': {
            const typedPayload = payload as UserModulesPayloadType<
              'DELETE',
              'public'
            >['payload'];
            return (
              typedOldData?.filter(
                (module) => module.id !== typedPayload.old_record.id,
              ) ?? []
            );
          }
        }
      },
    );
  };

  useEffect(() => {
    if (!user) return;

    supabaseClient.realtime.setAuth().then(() => {
      setHasSetAuth(true);
    });
  }, [supabaseClient, user]);

  const setupSubscription = useCallback(() => {
    if (!user) {
      return;
    }

    const changes = supabaseClient
      .channel(`topic:user-${user.id}-modules`, {
        config: { private: true },
      })
      .on('broadcast', { event: 'INSERT' }, (payload) => {
        const typedPayload = payload as UserModulesPayloadType<
          'INSERT',
          'public'
        >;
        updateModule('INSERT', typedPayload.payload);
      })
      .on('broadcast', { event: 'UPDATE' }, (payload) => {
        const typedPayload = payload as UserModulesPayloadType<
          'UPDATE',
          'public'
        >;
        updateModule('UPDATE', typedPayload.payload);
      })
      .on('broadcast', { event: 'DELETE' }, (payload) => {
        const typedPayload = payload as UserModulesPayloadType<
          'DELETE',
          'public'
        >;
        updateModule('DELETE', typedPayload.payload);
      })
      .subscribe();

    return () => {
      changes.unsubscribe();
    };
  }, [user, supabaseClient]);

  useEffect(() => {
    if (!hasSetAuth) {
      return;
    }
    const cleanup = setupSubscription();
    return cleanup;
  }, [setupSubscription, hasSetAuth]);
};

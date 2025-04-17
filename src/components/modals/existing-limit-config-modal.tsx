import { ComponentProps } from 'react';
import { LimitConfigModal } from '..';
import { ModulesQueries } from '../../queries';

type ExistingLimitConfigModalProps = Omit<
  ComponentProps<typeof LimitConfigModal>,
  'initMaxItems'
> & { actionId: string };

export const ExistingLimitConfigModal = ({
  actionId,
  ...rest
}: ExistingLimitConfigModalProps) => {
  const { data: limitConfig } = ModulesQueries.useLimitConfigQuery({
    actionId,
  });

  if (limitConfig === undefined) return null;

  return <LimitConfigModal {...rest} initMaxItems={limitConfig?.limit} />;
};

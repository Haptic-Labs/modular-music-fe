import { Flex } from '@radix-ui/themes';
import { ModulesQueries } from '../../queries';
import { AddActionButton } from './add-action-button';
import { ActionCard } from './module-actions/simple-action-card';

type ModuleActionsGridProps = {
  moduleId: string;
};

export const ModuleActionsList = ({ moduleId }: ModuleActionsGridProps) => {
  const { data: actions } = ModulesQueries.useModuleActionsQuery({ moduleId });

  return (
    <Flex gap='2' direction='column'>
      {actions?.map((action) => (
        <ActionCard key={action.id} action={action} onRemove={() => {}} />
      ))}
      <AddActionButton
        moduleId={moduleId}
        currentActionCount={actions?.length ?? 0}
      />
    </Flex>
  );
};

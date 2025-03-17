import { Flex } from '@radix-ui/themes';
import { ModulesQueries } from '../../queries';
import { AddActionButton } from './add-action-button';
import { ActionCard } from './module-actions';

type ModuleActionsGridProps = {
  moduleId: string;
};

export const ModuleActionsList = ({ moduleId }: ModuleActionsGridProps) => {
  const { data: actions } = ModulesQueries.useModuleActionsQuery({ moduleId });
  const { mutate: removeAction } =
    ModulesQueries.useRemoveModuleActionMutation();

  return (
    <Flex gap='2' direction='column'>
      {actions?.map((action) => (
        <ActionCard
          key={action.id}
          action={action}
          onRemove={() => {
            removeAction({ actionId: action.id });
          }}
        />
      ))}
      <AddActionButton
        moduleId={moduleId}
        currentActionCount={actions?.length ?? 0}
      />
    </Flex>
  );
};

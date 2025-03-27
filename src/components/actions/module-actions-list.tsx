import { Flex, Heading } from '@radix-ui/themes';
import { ModulesQueries } from '../../queries';
import { AddActionButton } from './add-action-button';
import { SortableActionCard } from './module-actions';
import { DndContext } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

type ModuleActionsGridProps = {
  moduleId: string;
};

export const ModuleActionsList = ({ moduleId }: ModuleActionsGridProps) => {
  const { data: actions = [] } = ModulesQueries.useModuleActionsQuery({
    moduleId,
  });
  const { mutate: removeAction } =
    ModulesQueries.useRemoveModuleActionMutation();

  const { mutate: reorderActions, isPending } =
    ModulesQueries.useReorderModuleActionsMutation(moduleId);

  return (
    <section>
      <Heading my='2'>Actions</Heading>
      <Flex gap='2' direction='column'>
        <DndContext
          onDragEnd={({ active, over }) => {
            if (over && active.id !== over.id) {
              const activeIndex = actions.findIndex(
                ({ id }) => id === active.id,
              );
              const overIndex = actions.findIndex(({ id }) => id === over.id);

              const newOrder = arrayMove(actions, activeIndex, overIndex);
              reorderActions({ action_ids: newOrder.map(({ id }) => id) });
            }
          }}
        >
          <SortableContext
            items={actions}
            strategy={verticalListSortingStrategy}
            disabled={isPending}
          >
            {actions?.map((action) => (
              <SortableActionCard
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
          </SortableContext>
        </DndContext>
      </Flex>
    </section>
  );
};

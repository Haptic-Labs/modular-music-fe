import { ModulesQueries } from '../../queries';
import { AddActionButton } from './add-action-button';
import { SortableActionCard } from './module-actions';
import { DndContext } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Fragment } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { ExistingLimitConfigModal } from '../modals';
import { Stack, Title } from '@mantine/core';

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

  const { mutate: upsertLimitAction } =
    ModulesQueries.useUpsertModuleLimitActionMutation();

  const [editModalIsOpen, editModalFns] = useDisclosure(false);

  return (
    <section>
      <Title my='2'>Actions</Title>
      <Stack gap='md'>
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
              <Fragment key={action.id}>
                <SortableActionCard
                  action={action}
                  onRemove={() => {
                    removeAction({ actionId: action.id });
                  }}
                  onEdit={
                    action.type === 'LIMIT'
                      ? () => editModalFns.open()
                      : undefined
                  }
                />
                {action.type === 'LIMIT' && (
                  <ExistingLimitConfigModal
                    opened={editModalIsOpen}
                    onClose={editModalFns.close}
                    onChange={(newOpen) =>
                      newOpen ? editModalFns.open() : editModalFns.close()
                    }
                    title='Edit Limit Action'
                    onSave={(maxItems) => {
                      upsertLimitAction(
                        {
                          module_id: moduleId,
                          actionId: action.id,
                          limit: maxItems,
                          order: action.order,
                        },
                        {
                          onSuccess: () => {
                            editModalFns.close();
                          },
                        },
                      );
                    }}
                    actionId={action.id}
                    isOpen={editModalIsOpen}
                  />
                )}
              </Fragment>
            ))}
            <AddActionButton
              moduleId={moduleId}
              currentActionCount={actions?.length ?? 0}
            />
          </SortableContext>
        </DndContext>
      </Stack>
    </section>
  );
};

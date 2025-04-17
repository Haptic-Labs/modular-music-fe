import { Dialog, Flex, Heading } from '@radix-ui/themes';
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
                <Dialog.Root
                  open={editModalIsOpen}
                  onOpenChange={(newOpen) =>
                    newOpen ? editModalFns.open() : editModalFns.close()
                  }
                >
                  {action.type === 'LIMIT' && (
                    <ExistingLimitConfigModal
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
                </Dialog.Root>
              </Fragment>
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

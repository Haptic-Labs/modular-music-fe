import { ModulesQueries } from '../../queries';
import { PlusIcon } from '@radix-ui/react-icons';
import { ModuleActionIcon } from './module-action-icon';
import { useDisclosure } from '@mantine/hooks';
import { LimitConfigModal, SourceSelectionModal } from '../modals';
import {
  ActionIcon,
  Button,
  Group,
  Popover,
  Text,
  Tooltip,
} from '@mantine/core';

type AddActionButtonProps = {
  moduleId: string;
  currentActionCount: number;
};

export const AddActionButton = ({
  moduleId,
  currentActionCount,
}: AddActionButtonProps) => {
  const {
    addShuffleMutation,
    upsertLimitMutation,
    addCombineMutation,
    addFilterMutation,
  } = ModulesQueries.useAddModuleActionMutations();

  const [filterConfigIsOpen, filterConfigFns] = useDisclosure(false);
  const [limitConfigIsOpen, limitConfigFns] = useDisclosure(false);
  const [combineConfigIsOpen, combineConfigFns] = useDisclosure(false);
  const [popoverIsOpen, popoverFns] = useDisclosure(false);

  return (
    <>
      <Button
        variant='soft'
        color='gray'
        css={{
          padding: 12,
          minHeight: 0,
          height: 'auto',
          justifyContent: 'start',
        }}
        radius='large'
      >
        <PlusIcon width={25} height={25} />
        <Text>Add Action</Text>
      </Button>
      <Popover
        opened={popoverIsOpen}
        onChange={(isOpen) => {
          if (isOpen) popoverFns.open();
          else popoverFns.close();
        }}
      >
        <Group gap='1' w='min-content'>
          <Tooltip label='Filter'>
            <ActionIcon
              color='gray'
              variant='soft'
              onClick={filterConfigFns.open}
            >
              <ModuleActionIcon type='FILTER' />
            </ActionIcon>
          </Tooltip>
          <SourceSelectionModal
            opened={filterConfigIsOpen}
            onClose={filterConfigFns.close}
            onSave={(selectedSources) => {
              addFilterMutation.mutate(
                {
                  module_id: moduleId,
                  order: currentActionCount,
                  sources: selectedSources.map(
                    (source) => ({
                      limit: null,
                      action_id: null,
                      id: null,
                      recently_listened_config:
                        source.source_type === 'RECENTLY_PLAYED'
                          ? source.recently_listened_config
                          : null,
                      spotify_id: source.spotify_id ?? null,
                      image_url: source.image_url ?? null,
                      source_type: source.source_type,
                      title: source.title,
                    }),
                    // TODO: update RLS on recently_played_sources_configs to account for sources other than modules_sources table (is this still applicable?)
                  ),
                },
                {
                  onSuccess: () => {
                    filterConfigFns.close();
                    popoverFns.close();
                  },
                },
              );
            }}
            isOpen={filterConfigIsOpen}
            onCancel={filterConfigFns.close}
          />
          <Tooltip label='Shuffle'>
            <ActionIcon
              color='gray'
              variant='soft'
              onClick={() => {
                addShuffleMutation.mutate(
                  {
                    moduleId,
                    newOrder: currentActionCount,
                  },
                  {
                    onSuccess: () => {
                      popoverFns.close();
                    },
                  },
                );
              }}
            >
              <ModuleActionIcon type='SHUFFLE' />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='Limit'>
            <ActionIcon
              color='gray'
              variant='soft'
              loading={upsertLimitMutation.isPending}
              onClick={limitConfigFns.open}
            >
              <ModuleActionIcon type='LIMIT' />
            </ActionIcon>
          </Tooltip>
          <LimitConfigModal
            opened={limitConfigIsOpen}
            onClose={limitConfigFns.close}
            onChange={(newOpen) =>
              newOpen ? limitConfigFns.open() : limitConfigFns.close()
            }
            onSave={(maxItems) => {
              upsertLimitMutation.mutate(
                {
                  module_id: moduleId,
                  order: currentActionCount,
                  limit: maxItems,
                },
                {
                  onSuccess: () => {
                    popoverFns.close();
                  },
                },
              );
            }}
            isOpen={limitConfigIsOpen}
          />
          <Tooltip label='Add Sources'>
            <ActionIcon
              color='gray'
              variant='soft'
              onClick={combineConfigFns.open}
            >
              <ModuleActionIcon type='COMBINE' />
            </ActionIcon>
          </Tooltip>
          <SourceSelectionModal
            opened={combineConfigIsOpen}
            onClose={combineConfigFns.close}
            onChange={(isOpen) => {
              if (isOpen) {
                combineConfigFns.open();
              } else {
                combineConfigFns.close();
              }
            }}
            onSave={(selectedSources) => {
              addCombineMutation.mutate(
                {
                  module_id: moduleId,
                  order: currentActionCount,
                  sources: selectedSources.map((source) => ({
                    limit: null,
                    action_id: null,
                    id: null,
                    recently_listened_config:
                      source.source_type === 'RECENTLY_PLAYED'
                        ? source.recently_listened_config
                        : null,
                    spotify_id: source.spotify_id ?? null,
                    image_url: source.image_url ?? null,
                    source_type: source.source_type,
                    title: source.title,
                  })),
                },
                {
                  onSuccess: () => {
                    combineConfigFns.close();
                    popoverFns.close();
                  },
                },
              );
            }}
            isOpen={combineConfigIsOpen}
            onCancel={combineConfigFns.close}
          />
        </Group>
      </Popover>
    </>
  );
};

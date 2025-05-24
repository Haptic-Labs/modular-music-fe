import { ModulesQueries } from '../../queries';
import { PlusIcon } from '@radix-ui/react-icons';
import { ModuleActionIcon } from './module-action-icon';
import { useDisclosure } from '@mantine/hooks';
import { LimitConfigModal, SourceSelectionModal } from '../modals';
import { ActionIcon, Button, Group, Popover, Tooltip } from '@mantine/core';
import { Database } from '../../types';

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

  const handleActionSelect = (
    actionType: Database['public']['Enums']['MODULE_ACTION_TYPE'],
  ) => {
    switch (actionType) {
      case 'SHUFFLE':
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
        return;
      case 'FILTER':
        filterConfigFns.open();
        break;
      case 'LIMIT':
        limitConfigFns.open();
        break;
      case 'COMBINE':
        combineConfigFns.open();
        break;
    }
    popoverFns.close();
  };

  return (
    <Popover
      opened={popoverIsOpen}
      onChange={(isOpen) => {
        if (isOpen) popoverFns.open();
        else popoverFns.close();
      }}
      withArrow
      position='bottom-start'
    >
      <Popover.Target>
        <Button
          variant='light'
          color='gray'
          css={{
            padding: 12,
            minHeight: 0,
            height: 'auto',
            justifyContent: 'start',
            fontWeight: 'normal',
          }}
          radius='large'
          onClick={popoverFns.open}
          leftSection={<PlusIcon width={25} height={25} />}
          justify='start'
        >
          Add Action
        </Button>
      </Popover.Target>

      <Popover.Dropdown
        css={(theme) => ({
          backgroundColor: theme.colors.dark[8],
        })}
      >
        <Group gap='sm' w='min-content' wrap='nowrap'>
          <Tooltip label='Filter'>
            <ActionIcon
              color='gray'
              variant='light'
              onClick={() => handleActionSelect('FILTER')}
              size='lg'
            >
              <ModuleActionIcon type='FILTER' />
            </ActionIcon>
          </Tooltip>

          <Tooltip label='Shuffle'>
            <ActionIcon
              color='gray'
              variant='light'
              size='lg'
              onClick={() => handleActionSelect('SHUFFLE')}
            >
              <ModuleActionIcon type='SHUFFLE' />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='Limit'>
            <ActionIcon
              color='gray'
              size='lg'
              variant='light'
              loading={upsertLimitMutation.isPending}
              onClick={() => handleActionSelect('LIMIT')}
            >
              <ModuleActionIcon type='LIMIT' />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='Add Sources'>
            <ActionIcon
              color='gray'
              variant='light'
              onClick={() => handleActionSelect('COMBINE')}
              size='lg'
            >
              <ModuleActionIcon type='COMBINE' />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Popover.Dropdown>
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
    </Popover>
  );
};

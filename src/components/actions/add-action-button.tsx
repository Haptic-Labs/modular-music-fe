import { ModulesQueries } from '../../queries';
import {
  Button,
  Dialog,
  Flex,
  IconButton,
  Popover,
  Text,
  Tooltip,
} from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { ModuleActionIcon } from './module-action-icon';
import { colors } from '../../theme/colors';
import { useDisclosure } from '@mantine/hooks';
import { LimitConfigModal, SourceSelectionModal } from '../modals';

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
      <Popover.Root
        open={popoverIsOpen}
        onOpenChange={(isOpen) => {
          if (isOpen) popoverFns.open();
          else popoverFns.close();
        }}
      >
        <Popover.Trigger>
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
            <Text size='3' weight='regular'>
              Add Action
            </Text>
          </Button>
        </Popover.Trigger>
        <Popover.Content width='fit-content' minWidth='unset'>
          <Flex gap='1' width='min-content'>
            <Dialog.Root
              open={filterConfigIsOpen}
              onOpenChange={(isOpen) => {
                if (isOpen) {
                  filterConfigFns.open();
                } else {
                  filterConfigFns.close();
                  popoverFns.close();
                }
              }}
            >
              <Tooltip content='Filter'>
                <Dialog.Trigger>
                  <IconButton color='gray' variant='soft' size='4'>
                    <ModuleActionIcon
                      type='FILTER'
                      color={colors.greenDark.green9}
                    />
                  </IconButton>
                </Dialog.Trigger>
              </Tooltip>
              <SourceSelectionModal
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
            </Dialog.Root>
            <Tooltip content='Shuffle'>
              <Popover.Close>
                <IconButton
                  color='gray'
                  variant='soft'
                  size='4'
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
                  <ModuleActionIcon
                    type='SHUFFLE'
                    color={colors.greenDark.green9}
                  />
                </IconButton>
              </Popover.Close>
            </Tooltip>
            <Dialog.Root
              open={limitConfigIsOpen}
              onOpenChange={(newOpen) =>
                newOpen ? limitConfigFns.open() : limitConfigFns.close()
              }
            >
              <Tooltip content='Limit'>
                <Dialog.Trigger>
                  <IconButton
                    color='gray'
                    variant='soft'
                    size='4'
                    loading={upsertLimitMutation.isPending}
                  >
                    <ModuleActionIcon
                      type='LIMIT'
                      color={colors.greenDark.green9}
                    />
                  </IconButton>
                </Dialog.Trigger>
              </Tooltip>
              <LimitConfigModal
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
            </Dialog.Root>
            <Dialog.Root
              open={combineConfigIsOpen}
              onOpenChange={(isOpen) => {
                if (isOpen) {
                  combineConfigFns.open();
                } else {
                  combineConfigFns.close();
                }
              }}
            >
              <Tooltip content='Add Sources'>
                <Dialog.Trigger>
                  <IconButton color='gray' variant='soft' size='4'>
                    <ModuleActionIcon
                      type='COMBINE'
                      color={colors.greenDark.green9}
                    />
                  </IconButton>
                </Dialog.Trigger>
              </Tooltip>
              <SourceSelectionModal
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
            </Dialog.Root>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </>
  );
};

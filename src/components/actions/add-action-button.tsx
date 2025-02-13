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
import { FilterActionConfigModal } from './config-modals';

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
    addLimitMutation,
    addCombineMutation,
    addFilterMutation,
  } = ModulesQueries.useAddModuleActionMutations();

  const [filterConfigIsOpen, filterConfigFns] = useDisclosure(false);
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
        <Popover.Content width='fit-content'>
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
                  <IconButton
                    color='gray'
                    variant='soft'
                    size='4'
                    onClick={filterConfigFns.open}
                  >
                    <ModuleActionIcon
                      type='FILTER'
                      color={colors.greenDark.green9}
                    />
                  </IconButton>
                </Dialog.Trigger>
              </Tooltip>
              <FilterActionConfigModal
                onSave={() => {
                  filterConfigFns.close();
                }}
              />
            </Dialog.Root>
            <Tooltip content='Shuffle'>
              <Popover.Close>
                <IconButton
                  color='gray'
                  variant='soft'
                  size='4'
                  onClick={() => {
                    addShuffleMutation.mutate({
                      moduleId,
                      newOrder: currentActionCount,
                    });
                  }}
                >
                  <ModuleActionIcon
                    type='SHUFFLE'
                    color={colors.greenDark.green9}
                  />
                </IconButton>
              </Popover.Close>
            </Tooltip>
            <Tooltip content='Limit'>
              <Popover.Close>
                <IconButton color='gray' variant='soft' size='4'>
                  <ModuleActionIcon
                    type='LIMIT'
                    color={colors.greenDark.green9}
                  />
                </IconButton>
              </Popover.Close>
            </Tooltip>
            <Tooltip content='Add Sources'>
              <Popover.Close>
                <IconButton color='gray' variant='soft' size='4'>
                  <ModuleActionIcon
                    type='COMBINE'
                    color={colors.greenDark.green9}
                  />
                </IconButton>
              </Popover.Close>
            </Tooltip>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </>
  );
};

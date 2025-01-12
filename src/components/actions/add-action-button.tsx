import { useDisclosure } from "@mantine/hooks";
import { ModulesQueries } from "../../queries";
import { Button, Dialog, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import { ModuleActionSelectionModal } from "../modals/module-action-selection-modal";

type AddActionButtonProps = {
  moduleId: string;
};

export const AddActionButton = ({ moduleId }: AddActionButtonProps) => {
  // TODO: move this to config portion of modal
  const {
    addShuffleMutation,
    addLimitMutation,
    addCombineMutation,
    addFilterMutation,
  } = ModulesQueries.useAddModuleActionMutations();

  const [isOpen, { open, close }] = useDisclosure(false);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(newVal) => (newVal ? open() : close())}
    >
      <Dialog.Trigger>
        <Button
          variant="soft"
          color="gray"
          css={{
            padding: 12,
            minHeight: 0,
            height: "auto",
            justifyContent: "start",
          }}
          radius="large"
        >
          <PlusIcon width={25} height={25} />
          <Text size="3" weight="regular">
            Add Action
          </Text>
        </Button>
      </Dialog.Trigger>
      <ModuleActionSelectionModal onSubmit={() => {}} />
    </Dialog.Root>
  );
};

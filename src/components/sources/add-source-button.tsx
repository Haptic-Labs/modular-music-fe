import { useDisclosure } from "@mantine/hooks";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button, Dialog, Text } from "@radix-ui/themes";
import { SourceConfig, SpotifySourceSelectionModal } from "../modals";
import { Database } from "../../types";
import { ModulesQueries } from "../../queries";

type AddSourceButtonProps = {
  moduleId: string;
};

export const AddSourceButton = ({ moduleId }: AddSourceButtonProps) => {
  const { mutate: saveRecentlyListened } =
    ModulesQueries.useAddRecentlyListenedSource();
  const { mutate: saveNewSource } =
    ModulesQueries.useAddBasicModuleSourceMutation();

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
            Add Source
          </Text>
        </Button>
      </Dialog.Trigger>
      <SpotifySourceSelectionModal
        onSelect={<
          T extends Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"],
        >(
          source: Omit<SourceConfig<T>, "module_id">,
        ) => {
          if (!moduleId) return;
          if (source.type === "RECENTLY_PLAYED" && !!source.additionalConfig) {
            saveRecentlyListened({
              p_module_id: moduleId,
              p_interval: source.additionalConfig.interval,
              p_quantity: source.additionalConfig.quantity,
            });
          } else if (source.type !== "RECENTLY_PLAYED") {
            saveNewSource({
              module_id: moduleId,
              spotify_id: source.spotify_id,
              image_url: source.image_url,
              title: source.title,
              type: source.type,
            });
          }
          close();
        }}
      />
    </Dialog.Root>
  );
};

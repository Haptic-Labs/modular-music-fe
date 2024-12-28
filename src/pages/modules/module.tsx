import { useParams } from "react-router-dom";
import { ModulesQueries } from "../../queries";
import {
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Heading,
  IconButton,
  Popover,
  Text,
} from "@radix-ui/themes";
import { Cross1Icon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";
import {
  SourceConfig,
  SpotifySourceSelectionModal,
  SpotifyComponents,
  ModuleSourceCard,
} from "../../components";
import { useDisclosure } from "@mantine/hooks";
import { Database } from "../../types";
import { RecentlyListenedConfigPopover } from "../../components/popovers";

export const ModulePage = () => {
  const { moduleId } = useParams();
  const { data: sources = [] } = ModulesQueries.useModuleSourcesQuery(
    {
      moduleId: moduleId ?? "",
    },
    {
      enabled: !!moduleId,
    },
  );
  const recentlyListenedSourceIds = sources
    .filter((source) => source.type === "RECENTLY_PLAYED")
    .map((source) => source.id);
  const { data: recentlyListenedConfigs } =
    ModulesQueries.useMultipleRecentlyListenedConfigsQuery(
      {
        sourceIds: recentlyListenedSourceIds,
      },
      { enabled: !!recentlyListenedSourceIds.length },
    );
  const { mutate: saveRecentlyListened } =
    ModulesQueries.useAddRecentlyListenedSource();
  const { mutate: saveNewSource } =
    ModulesQueries.useAddBasicModuleSourceMutation();
  const { mutate: removeSource } =
    ModulesQueries.useRemoveModuleSourceMutation();
  const [isOpen, { open, close }] = useDisclosure(false);

  return (
    <div
      css={{
        padding: 12,
      }}
    >
      <Heading my="2">Sources</Heading>
      <Grid
        columns={{
          initial: "2",
          sm: "2",
          xs: "1",
          lg: "3",
          xl: "4",
        }}
        gap="2"
      >
        {sources.map(
          (source) => (
            <ModuleSourceCard source={source} />
          ),
          //   {
          //   const recentlyListenedConfig = recentlyListenedSourceIds.includes(
          //     source.id,
          //   )
          //     ? recentlyListenedConfigs?.find((config) => config.id === source.id)
          //     : undefined;
          //   return (
          //     <Card
          //       key={source.id}
          //       css={{
          //         display: "flex",
          //         gap: 8,
          //         alignItems: "center",
          //         justifyContent: "space-between",
          //       }}
          //     >
          //       <Flex gap="2" align="center">
          //         <SpotifyComponents.SourceImage
          //           src={source.image_url}
          //           sourceType={source.type}
          //           css={{
          //             width: 20,
          //             height: 20,
          //             padding: 4,
          //           }}
          //         />
          //         <Flex direction="column">
          //           <Text>{source.title}</Text>
          //           {!!recentlyListenedConfig && (
          //             <Text
          //               color="gray"
          //               size="2"
          //             >{`Last ${recentlyListenedConfig.quantity.toLocaleString()} ${recentlyListenedConfig.interval.toLowerCase()}`}</Text>
          //           )}
          //         </Flex>
          //       </Flex>
          //       <Flex gap="4" mr="2" align="center">
          //         {!!recentlyListenedConfig && (
          //           <Popover.Root>
          //             <Popover.Trigger>
          //               <IconButton color="gray" variant="ghost">
          //                 <Pencil1Icon />
          //               </IconButton>
          //             </Popover.Trigger>
          //             <RecentlyListenedConfigPopover
          //               onSave={({ interval, quantity }) => {
          //                 saveRecentlyListened({
          //                   p_interval: interval,
          //                   p_quantity: quantity,
          //                   p_module_id: source.module_id,
          //                   p_source_id: source.id,
          //                 });
          //               }}
          //             />
          //           </Popover.Root>
          //         )}
          //         <IconButton
          //           color="gray"
          //           variant="ghost"
          //           onClick={() => {
          //             removeSource({ sourceId: source.id });
          //           }}
          //         >
          //           <Cross1Icon />
          //         </IconButton>
          //       </Flex>
          //     </Card>
          //   );
          // }
        )}
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
              if (
                source.type === "RECENTLY_PLAYED" &&
                !!source.additionalConfig
              ) {
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
      </Grid>
    </div>
  );
};

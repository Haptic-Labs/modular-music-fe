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
  Text,
} from "@radix-ui/themes";
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
import {
  SourceConfig,
  SpotifySourceSelectionModal,
  SpotifyComponents,
} from "../../components";
import { useDisclosure } from "@mantine/hooks";
import { Database } from "../../types";

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
        {sources.map((source) => (
          <Card
            css={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Flex gap="2" align="center">
              <SpotifyComponents.SourceImage
                src={source.image_url}
                sourceType={source.type}
                css={{
                  width: 20,
                  height: 20,
                  padding: 4,
                }}
              />
              <Text>{source.title}</Text>
            </Flex>
            <IconButton color="gray" variant="ghost" mr="1" onClick={() => {}}>
              <Cross1Icon />
            </IconButton>
          </Card>
        ))}
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
              <Text>Add Source</Text>
            </Button>
          </Dialog.Trigger>
          <SpotifySourceSelectionModal
            onSelect={<
              T extends Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"],
            >(
              source: SourceConfig<T>,
            ) => {
              // TODO: add saving and cache update or refetch
              console.log(source);
              close();
            }}
          />
        </Dialog.Root>
      </Grid>
    </div>
  );
};

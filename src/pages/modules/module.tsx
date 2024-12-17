import { useParams } from "react-router-dom";
import { ModulesQueries } from "../../queries";
import { Button, Card, Dialog, Grid, Heading, Text } from "@radix-ui/themes";
import { SpotifyComponents } from "../../ui";
import { PlusIcon } from "@radix-ui/react-icons";
import { SourceConfig, SpotifySourceSelectionModal } from "../../components";
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
        }}
        gap="2"
      >
        {sources.map((source) => (
          <Card
            css={{
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <SpotifyComponents.SourceImage
              src={source.image_url}
              sourceType={source.type}
              css={{
                width: 20,
                height: 20,
                padding: 4,
              }}
            />
            <div>
              <Text>{source.title}</Text>
            </div>
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
              console.log(source);
              close();
            }}
          />
        </Dialog.Root>
      </Grid>
    </div>
  );
};

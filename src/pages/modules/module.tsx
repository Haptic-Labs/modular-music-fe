import { useParams } from "react-router-dom";
import { ModulesQueries } from "../../queries";
import { Button, Card, Dialog, Grid, Heading, Text } from "@radix-ui/themes";
import { SourceImage } from "../../ui/source-image";
import { PlusIcon } from "@radix-ui/react-icons";

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
            <SourceImage
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
        <Dialog.Root>
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
        </Dialog.Root>
      </Grid>
    </div>
  );
};

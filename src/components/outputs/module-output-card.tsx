import { Database } from '../../types';
import { SpotifyComponents } from '..';
import { Cross1Icon } from '@radix-ui/react-icons';
import { ModulesQueries } from '../../queries';
import { titleCase } from '../../utils';
import { ActionIcon, Card, Group, Stack, Text } from '@mantine/core';

type ModuleOutputCardProps = {
  output: Database['public']['Tables']['module_outputs']['Row'];
};

export const ModuleOutputCard = ({ output }: ModuleOutputCardProps) => {
  const { mutate, isPending: isRemoving } =
    ModulesQueries.useRemoveModuleOutputMutation();

  return (
    <Card
      css={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: isRemoving ? 0.5 : 1,
      }}
    >
      <Group gap='2' align='center'>
        <SpotifyComponents.SourceImage
          src={output.image_url ?? undefined}
          sourceType='PLAYLIST'
          css={{
            width: 40,
            height: 40,
            padding: 4,
            borderRadius: 8,
          }}
        />
        <Stack>
          <Text>{output.title}</Text>
          <Text c='gray'>{`Mode: ${titleCase(output.mode)}`}</Text>
        </Stack>
      </Group>
      <ActionIcon
        variant='ghost'
        color='gray'
        data-override='fix-margin'
        onClick={() => {
          mutate({
            outputId: output.id,
          });
        }}
        loading={isRemoving}
      >
        <Cross1Icon />
      </ActionIcon>
    </Card>
  );
};

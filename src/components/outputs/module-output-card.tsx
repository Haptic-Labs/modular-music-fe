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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: isRemoving ? 0.5 : 1,
      }}
      px='sm'
      py='xs'
      radius='md'
    >
      <Group gap='xs' align='center' wrap='nowrap'>
        <SpotifyComponents.SourceImage
          src={output.image_url ?? undefined}
          sourceType='PLAYLIST'
          css={{
            width: 50,
            height: 50,
            padding: 4,
            borderRadius: 8,
          }}
        />
        <Stack gap={0}>
          <Text>{output.title}</Text>
          <Text
            c='gray'
            size='sm'
            css={{ opacity: 0.7 }}
          >{`Mode: ${titleCase(output.mode)}`}</Text>
        </Stack>
      </Group>
      <ActionIcon
        variant='subtle'
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

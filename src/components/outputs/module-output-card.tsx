import { Card, Flex, IconButton, Text } from '@radix-ui/themes';
import { Database } from '../../types';
import { SpotifyComponents } from '..';
import { Cross1Icon } from '@radix-ui/react-icons';
import { ModulesQueries } from '../../queries';

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
      <Flex gap='2' align='center'>
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
        <Text>{output.title}</Text>
      </Flex>
      <IconButton
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
      </IconButton>
    </Card>
  );
};

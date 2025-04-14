import { Card, Flex, IconButton, Text } from '@radix-ui/themes';
import { Database } from '../../types';
import { SpotifyComponents } from '..';
import { Cross1Icon } from '@radix-ui/react-icons';
import { ModulesQueries } from '../../queries';
import { titleCase } from '../../utils';

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
        <Flex direction='column'>
          <Text>{output.title}</Text>
          <Text size='2' color='gray'>
            {`Mode: ${titleCase(output.mode)}`}
          </Text>
        </Flex>
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

import { Card, Flex, IconButton, Text } from '@radix-ui/themes';
import { Database } from '../../types';
import { SpotifyComponents } from '..';
import { Cross1Icon } from '@radix-ui/react-icons';

type ModuleOutputCardProps = {
  output: Database['public']['Tables']['module_outputs']['Row'];
};

export const ModuleOutputCard = ({ output }: ModuleOutputCardProps) => {
  // const {isPending: isRemoving} = Modulc

  return (
    <Card
      css={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        // opacity: isRemoving ? 0.5 : 1,
      }}
    >
      <Flex gap='2' align='center'>
        <SpotifyComponents.SourceImage
          src={output.image_url}
          sourceType='PLAYLIST'
          css={{
            width: 20,
            height: 20,
            padding: 4,
          }}
        />
        <Text>{output.title}</Text>
      </Flex>
      <IconButton variant='ghost' color='gray' data-override='fix-margin'>
        <Cross1Icon />
      </IconButton>
    </Card>
  );
};

import { ImageIcon } from '@radix-ui/react-icons';
import {
  Avatar,
  Button,
  Flex,
  Popover,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { useFileDialog } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { Playlist } from '@soundify/web-api';
import { SpotifyQueries } from '../../queries';

type PlaylistCreationPopoverContentProps = {
  onSave?: (playlist: Playlist) => void;
};

export const PlaylistCreationPopoverContent = ({
  onSave,
}: PlaylistCreationPopoverContentProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const fileDialog = useFileDialog({ multiple: false, accept: 'image/*' });
  const imageSrc = useMemo(() => {
    const selectedFile = fileDialog.files?.item(0);
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      return objectUrl;
    }
    return undefined;
  }, [JSON.stringify(fileDialog.files?.item(0))]);

  const { mutate: createPlaylist, isPending: isSaving } =
    SpotifyQueries.useCreatePlaylistMutation({
      onSuccess: (playlist) => onSave?.(playlist),
    });

  const handleSave = async () => {
    console.log('brayden-test', 'save');
    const selectedFile = fileDialog.files?.item(0);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result !== 'string') throw new Error('Invalid image format');
        createPlaylist({
          name,
          description,
          public: false,
          collaborative: false,
          imageBase64: result,
        });
      };
    } else {
      createPlaylist({
        name,
        description,
        public: false,
        collaborative: false,
      });
    }
  };

  return (
    <Popover.Content
      css={{ display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <Text size='4' weight='bold'>
        Create a new playlist:
      </Text>
      <Flex gap='2'>
        <Avatar
          asChild
          size='9'
          fallback={<ImageIcon width={30} height={30} />}
          src={imageSrc}
          color='gray'
        >
          <Button
            css={{
              height: 150,
              width: 150,
            }}
            onClick={() => {
              fileDialog.open();
            }}
          />
        </Avatar>
        <Flex direction='column' gap='2'>
          <TextField.Root
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Playlist name'
          />
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Playlist description'
          />
          <Flex gap='2' width='100%' justify='end'>
            <Button variant='outline' color='gray'>
              Cancel
            </Button>
            <Button disabled={!name} onClick={handleSave} loading={isSaving}>
              Save
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Popover.Content>
  );
};

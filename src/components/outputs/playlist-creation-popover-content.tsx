import { ImageIcon, Pencil2Icon } from '@radix-ui/react-icons';
import { useDisclosure, useFileDialog } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { Playlist } from '@soundify/web-api';
import { SpotifyQueries } from '../../queries';
import imageCompression from 'browser-image-compression';
import { convertImageToJpeg } from '../../utils';
import {
  Avatar,
  Button,
  Container,
  Group,
  Overlay,
  Stack,
  Text,
  Textarea,
  TextInput,
  useMantineTheme,
} from '@mantine/core';

const MAX_IMAGE_BYTES = 250 * 1000; // 256 KB with headroom

type PlaylistCreationPopoverContentProps = {
  onSave?: (playlist: Playlist) => void;
  onCancel: () => void;
};

export const PlaylistCreationPopoverContent = ({
  onSave,
  onCancel,
}: PlaylistCreationPopoverContentProps) => {
  const theme = useMantineTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showImageUploadOverlay, imageUploadOverlayFns] = useDisclosure(false);
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
    const selectedFile = fileDialog.files?.item(0);
    if (selectedFile) {
      try {
        // First convert to JPEG
        const jpegFile = selectedFile.type.includes('jpeg')
          ? selectedFile
          : await convertImageToJpeg(selectedFile);

        // Then compress the image
        let compressedFile = await imageCompression(jpegFile, {
          maxSizeMB: 0.25,
          maxWidthOrHeight: 480,
          useWebWorker: true,
          fileType: 'image/jpeg',
          alwaysKeepResolution: false,
        });

        if (compressedFile.size > MAX_IMAGE_BYTES) {
          compressedFile = await imageCompression(jpegFile, {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 300,
            useWebWorker: true,
            fileType: 'image/jpeg',
            alwaysKeepResolution: false,
          });
        }

        console.log('brayden-test', { compressedFile });
        // return;

        // Convert the compressed image to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          if (typeof result !== 'string')
            throw new Error('Invalid image format');

          const resultWithoutPrefix = result.split(',')[1]; // Remove the data URL prefix

          createPlaylist({
            name,
            description,
            public: false,
            collaborative: false,
            imageBase64: resultWithoutPrefix,
          });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error processing image:', error);
        // Fallback to uncompressed image or show error
      }
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
    <Stack gap='md'>
      <Text css={{ fontWeight: 'bold' }}>Create a new playlist:</Text>
      <Group gap='xs' align='start'>
        <Container
          pos='relative'
          p={0}
          onMouseEnter={imageUploadOverlayFns.open}
          onMouseLeave={imageUploadOverlayFns.close}
        >
          <Avatar
            radius='md'
            size='xl'
            src={imageSrc}
            color='gray'
            onClick={fileDialog.open}
            role='button'
            css={(theme) => ({
              cursor: 'pointer',
              ':hover': {
                backgroundColor: theme.colors.dark[8],
              },
            })}
          >
            <ImageIcon width={30} height={30} />
          </Avatar>
          {showImageUploadOverlay && imageSrc && (
            <Overlay
              onClick={fileDialog.open}
              css={{
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Pencil2Icon width={25} height={25} />
            </Overlay>
          )}
        </Container>

        <Stack gap='xs'>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Playlist name'
            styles={{ input: { backgroundColor: theme.colors.dark[8] } }}
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Playlist description'
            styles={{ input: { backgroundColor: theme.colors.dark[8] } }}
          />
          <Group gap='xs' w='100%' justify='end'>
            <Button variant='outline' color='gray' onClick={onCancel}>
              Cancel
            </Button>
            <Button disabled={!name} onClick={handleSave} loading={isSaving}>
              Save
            </Button>
          </Group>
        </Stack>
      </Group>
    </Stack>
  );
};

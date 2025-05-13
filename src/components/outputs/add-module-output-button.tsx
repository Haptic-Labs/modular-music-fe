import { useDisclosure } from '@mantine/hooks';
import { PlusIcon } from '@radix-ui/react-icons';
import { ModulesQueries } from '../../queries';
import { UserPlaylistSelectionModalContents } from './user-playlist-selection-modal-contents';
import { Button, Text } from '@mantine/core';

export const AddModuleOutputButton = ({ moduleId }: { moduleId: string }) => {
  const { mutate, isPending: isSaving } =
    ModulesQueries.useAddModuleOutputMutation();

  const [isOpen, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button
        variant='soft'
        color='gray'
        css={{
          padding: 12,
          minHeight: 0,
          height: 'auto',
          justifyContent: 'start',
        }}
        radius='large'
        onClick={open}
      >
        <PlusIcon width={25} height={25} />
        <Text>Add Output</Text>
      </Button>
      <UserPlaylistSelectionModalContents
        opened={isOpen}
        onClose={close}
        onChange={(newOpen) => (newOpen ? open() : close())}
        enableQuery={isOpen}
        onSave={(playlist, mode) => {
          mutate(
            {
              module_id: moduleId,
              title: playlist.name,
              image_url: playlist.images?.[0]?.url || null,
              de_dupe: true,
              mode,
              spotify_id: playlist.id,
              type: 'PLAYLIST',
            },
            {
              onSuccess: () => {
                close();
              },
            },
          );
        }}
        isSaving={isSaving}
      />
    </>
  );
};

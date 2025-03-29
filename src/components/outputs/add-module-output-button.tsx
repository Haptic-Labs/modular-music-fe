import { useDisclosure } from '@mantine/hooks';
import { PlusIcon } from '@radix-ui/react-icons';
import { Button, Dialog, Text } from '@radix-ui/themes';
import { ModulesQueries } from '../../queries';
import { UserPlaylistSelectionModalContents } from './user-playlist-selection-modal-contents';

export const AddModuleOutputButton = ({ moduleId }: { moduleId: string }) => {
  const { mutate, isPending: isSaving } =
    ModulesQueries.useAddModuleOutputMutation();

  const [isOpen, { open, close }] = useDisclosure(false);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(newOpen) => (newOpen ? open() : close())}
    >
      <Dialog.Trigger>
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
        >
          <PlusIcon width={25} height={25} />
          <Text size='3' weight='regular'>
            Add Output
          </Text>
        </Button>
      </Dialog.Trigger>
      <UserPlaylistSelectionModalContents
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
    </Dialog.Root>
  );
};

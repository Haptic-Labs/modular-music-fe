import { useDisclosure } from '@mantine/hooks';
import { PlusIcon } from '@radix-ui/react-icons';
import { ModulesQueries } from '../../queries';
import { UserPlaylistSelectionModalContents } from './user-playlist-selection-modal-contents';
import { Button } from '@mantine/core';

export const AddModuleOutputButton = ({ moduleId }: { moduleId: string }) => {
  const { mutate, isPending: isSaving } =
    ModulesQueries.useAddModuleOutputMutation();
  const { data: otherOutputIds } = ModulesQueries.useModuleOutputsQuery(
    {
      moduleId,
    },
    { select: (data) => data.map((output) => output.spotify_id) },
  );
  const [isOpen, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button
        variant='light'
        color='gray'
        size='md'
        css={{
          height: 'auto',
          fontWeight: 'normal',
        }}
        radius='md'
        onClick={open}
        justify='start'
        leftSection={<PlusIcon width={25} height={25} />}
      >
        Add Output
      </Button>
      <UserPlaylistSelectionModalContents
        opened={isOpen}
        onClose={close}
        onChange={(newOpen) => (newOpen ? open() : close())}
        enableQuery={isOpen}
        otherOutputIds={otherOutputIds || []}
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

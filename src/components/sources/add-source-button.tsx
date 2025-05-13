import { useDisclosure } from '@mantine/hooks';
import { Pencil1Icon, PlusIcon } from '@radix-ui/react-icons';
import { ModulesQueries } from '../../queries';
import { SelectedSource, SourceSelectionModal } from '../modals';
import { Button, Text } from '@mantine/core';

type EditModuleSourcesButtonProps = {
  moduleId: string;
  currentSources: SelectedSource[];
};

export const EditModuleSourcesButton = ({
  moduleId,
  currentSources,
}: EditModuleSourcesButtonProps) => {
  const { mutate: saveRecentlyListened } =
    ModulesQueries.useAddRecentlyListenedSource();
  const { mutate: saveNewSources } =
    ModulesQueries.useReplaceModuleSourcesMutation({
      onSuccess: () => {
        close();
      },
    });

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
        {currentSources.length ? (
          <Pencil1Icon width={25} height={25} />
        ) : (
          <PlusIcon width={25} height={25} />
        )}
        <Text>{currentSources.length ? 'Edit Sources' : 'Select Sources'}</Text>
      </Button>
      <SourceSelectionModal
        opened={isOpen}
        onClose={close}
        initialSelectedSources={currentSources}
        onSave={(sources) => {
          if (!moduleId) return;
          const { recentlyListenedSource, otherSources } = sources.reduce<{
            recentlyListenedSource?: SelectedSource;
            otherSources: SelectedSource[];
          }>(
            (acc, curr) => {
              if (curr.source_type === 'RECENTLY_PLAYED') {
                const typedSource = curr as SelectedSource;
                acc['recentlyListenedSource'] = typedSource;
              } else {
                acc['otherSources'].push(curr);
              }
              return acc;
            },
            { otherSources: [] },
          );
          if (recentlyListenedSource?.recently_listened_config) {
            saveRecentlyListened({
              p_module_id: moduleId,
              p_interval:
                recentlyListenedSource.recently_listened_config.interval,
              p_quantity:
                recentlyListenedSource.recently_listened_config.quantity,
            });
          }
          if (otherSources.length === 0) return;
          saveNewSources({
            sources: otherSources,
            moduleId,
          });
          close();
        }}
        isOpen={isOpen}
        onCancel={close}
      />
    </>
  );
};

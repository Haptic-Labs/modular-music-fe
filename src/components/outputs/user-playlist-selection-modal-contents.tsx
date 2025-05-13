import { SpotifyQueries } from '../../queries';
import { IconPlaylist, IconSearch } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { Database } from '../../types';
import { PlusIcon } from '@radix-ui/react-icons';
import { PlaylistCreationPopoverContent } from './playlist-creation-popover-content';
import { useDisclosure } from '@mantine/hooks';
import { SimplifiedPlaylist } from '@soundify/web-api';
import {
  ActionIcon,
  Avatar,
  Button,
  Grid,
  Group,
  Modal,
  ModalProps,
  Popover,
  ScrollArea,
  TextInput,
  Title,
  Text,
  Select,
} from '@mantine/core';

type UserPlaylistSelectionModalContentsProps = {
  hideCreation?: boolean;
  enableQuery?: boolean;
  onSave: (
    playlist: SimplifiedPlaylist,
    mode: Database['public']['Enums']['MODULE_OUTPUT_MODE'],
  ) => void;
  isSaving: boolean;
} & ModalProps;

export const UserPlaylistSelectionModalContents = ({
  hideCreation,
  enableQuery,
  onSave,
  isSaving,
  ...modalProps
}: UserPlaylistSelectionModalContentsProps) => {
  const [selectedOutput, setSelectedOutput] = useState<SimplifiedPlaylist>();
  const [selectedMode, setSelectedMode] =
    useState<Database['public']['Enums']['MODULE_OUTPUT_MODE']>();
  const [searchText, setSearchText] = useState('');
  const modeSelectRef = useRef<HTMLInputElement>(null);

  const [playlistCreationIsOpen, playlistCreationFns] = useDisclosure(false);

  const { data: playlists = [] } = SpotifyQueries.useUserPlaylists({
    enabled: enableQuery,
    select: (data) => {
      return data.filter((playlist) =>
        playlist.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    },
  });

  const handleOutputSelect = (playlist?: SimplifiedPlaylist) => {
    if (playlist) {
      modeSelectRef.current?.click();
    }
    setSelectedOutput(playlist);
  };

  return (
    <Modal
      mah='min(700px, 90vh)'
      mih='min(700px, 90vh)'
      css={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        gap: 12,
      }}
      {...modalProps}
    >
      <Title css={{ flexShrink: 0, marginBottom: 0 }}>Select an Output:</Title>
      <Group css={{ flexShrink: 0, width: '100%' }} gap='2'>
        <TextInput
          placeholder='Search your playlists...'
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          css={{ flexGrow: 1 }}
          leftSection={<IconSearch />}
        />
        {!hideCreation && (
          <>
            <ActionIcon
              title='Create a new playlist'
              onClick={playlistCreationFns.open}
            >
              <PlusIcon />
            </ActionIcon>
            <Popover
              opened={playlistCreationIsOpen}
              onChange={(open) =>
                open ? playlistCreationFns.open() : playlistCreationFns.close()
              }
            >
              <PlaylistCreationPopoverContent
                onSave={(playlist) => {
                  handleOutputSelect(playlist);
                  playlistCreationFns.close();
                }}
              />
            </Popover>
          </>
        )}
      </Group>
      <ScrollArea css={{ flexGrow: 1 }}>
        <Grid columns={2} gutter='md'>
          {playlists.map((playlist) => {
            return (
              <Button
                variant={selectedOutput?.id === playlist.id ? 'solid' : 'soft'}
                color={selectedOutput?.id === playlist.id ? 'green' : 'gray'}
                key={playlist.id}
                css={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  justifyContent: 'start',
                  padding: 8,
                  height: 'fit-content',
                  minHeight: 50,
                }}
                title={playlist.name}
                onClick={() => handleOutputSelect(playlist)}
              >
                <Avatar
                  src={playlist.images?.[0]?.url}
                  css={(theme) => ({ backgroundColor: theme.colors.gray[2] })}
                >
                  <IconPlaylist />
                </Avatar>
                <Text css={{ textWrap: 'nowrap' }} truncate>
                  {playlist.name}
                </Text>
              </Button>
            );
          })}
        </Grid>
      </ScrollArea>
      <Group justify='end' css={{ flexShrink: 0, gap: 8 }}>
        <Select
          value={selectedMode}
          onChange={(value) =>
            setSelectedMode(
              value as Database['public']['Enums']['MODULE_OUTPUT_MODE'],
            )
          }
          placeholder='Select a mode...'
          ref={modeSelectRef}
          data={[
            { value: 'PREPEND', label: 'Prepend' },
            { value: 'REPLACE', label: 'Replace' },
            { value: 'APPEND', label: 'Append' },
          ]}
          renderOption={(item) => (
            <Text
              title={
                item.option.value === 'PREPEND'
                  ? 'Add the resulting tracks to the beginning of the playlist'
                  : item.option.value === 'REPLACE'
                    ? 'Replace all items in the playlist with the resulting tracks'
                    : item.option.value === 'APPEND'
                      ? 'Add the resulting tracks to the end of the playlist'
                      : ''
              }
            >
              {item.option.label ?? item.option.value}
            </Text>
          )}
        />
        <Button
          disabled={!selectedOutput || !selectedMode}
          onClick={() => {
            if (selectedOutput && selectedMode) {
              onSave(selectedOutput, selectedMode);
            }
          }}
          loading={isSaving}
        >
          Save
        </Button>
      </Group>
    </Modal>
  );
};

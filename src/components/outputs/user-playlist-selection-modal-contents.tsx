import { SpotifyQueries } from '../../queries';
import { IconPlaylist, IconSearch } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { Database } from '../../types';
import { PlusIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { PlaylistCreationPopoverContent } from './playlist-creation-popover-content';
import { useDisclosure } from '@mantine/hooks';
import { SimplifiedPlaylist } from '@soundify/web-api';
import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  Modal,
  ModalProps,
  Popover,
  TextInput,
  Text,
  Select,
  useMantineTheme,
  SimpleGrid,
  Tooltip,
} from '@mantine/core';

type UserPlaylistSelectionModalContentsProps = {
  hideCreation?: boolean;
  enableQuery?: boolean;
  onSave: (
    playlist: SimplifiedPlaylist,
    mode: Database['public']['Enums']['MODULE_OUTPUT_MODE'],
  ) => void;
  isSaving: boolean;
  otherOutputIds: string[];
} & ModalProps;

export const UserPlaylistSelectionModalContents = ({
  hideCreation,
  enableQuery,
  onSave,
  isSaving,
  otherOutputIds,
  ...modalProps
}: UserPlaylistSelectionModalContentsProps) => {
  const theme = useMantineTheme();
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
      modeSelectRef.current?.focus();
    }
    setSelectedOutput(playlist);
  };

  useEffect(() => {
    if (!modalProps.opened) {
      setSelectedOutput(undefined);
      setSelectedMode(undefined);
      setSearchText('');
      playlistCreationFns.close();
    }
  }, [modalProps.opened]);

  return (
    <Modal
      centered
      title='Select an Output:'
      styles={{
        title: { fontSize: theme.fontSizes.xl, fontWeight: 'bold' },
        content: {
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'min(650px, 90vh)',
        },
        body: {
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.xs,
        },
      }}
      {...modalProps}
    >
      <Group gap='xs' mih='fit-content'>
        <TextInput
          placeholder='Search your playlists...'
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          css={{ flexGrow: 1 }}
          leftSection={<IconSearch width={15} height={15} />}
        />
        {!hideCreation && (
          <Popover
            opened={playlistCreationIsOpen}
            onChange={(open) =>
              open ? playlistCreationFns.open() : playlistCreationFns.close()
            }
            withArrow
          >
            <Popover.Target>
              <ActionIcon
                size='lg'
                title='Create a new playlist'
                onClick={playlistCreationFns.open}
              >
                <PlusIcon width={20} height={20} />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown bg={theme.colors.dark[7]}>
              <PlaylistCreationPopoverContent
                onSave={(playlist) => {
                  handleOutputSelect(playlist);
                  playlistCreationFns.close();
                }}
                onCancel={playlistCreationFns.close}
              />
            </Popover.Dropdown>
          </Popover>
        )}
      </Group>
      <SimpleGrid
        cols={{ sm: 2, base: 1 }}
        spacing='xs'
        h='100%'
        css={{ overflowY: 'auto', overflowX: 'hidden' }}
      >
        {playlists.map((playlist) => {
          if (otherOutputIds.includes(playlist.id)) return null;
          return (
            <Button
              variant={selectedOutput?.id === playlist.id ? 'solid' : 'light'}
              color={selectedOutput?.id === playlist.id ? 'green' : 'gray'}
              key={playlist.id}
              title={playlist.name}
              onClick={() => handleOutputSelect(playlist)}
              justify='start'
              h={50}
              leftSection={
                <Avatar
                  radius='md'
                  src={playlist.images?.[0]?.url}
                  css={(theme) => ({ backgroundColor: theme.colors.gray[2] })}
                >
                  <IconPlaylist />
                </Avatar>
              }
            >
              <Text size='sm' w='100%' truncate>
                {playlist.name}
              </Text>
            </Button>
          );
        })}
      </SimpleGrid>
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
          styles={{ option: { paddingRight: 4 } }}
          renderOption={(item) => (
            <Group justify='space-between' w='100%'>
              <Text>{item.option.label ?? item.option.value}</Text>
              <Tooltip
                color='dark'
                label={
                  item.option.value === 'PREPEND'
                    ? 'Add the resulting tracks to the beginning of the playlist'
                    : item.option.value === 'REPLACE'
                      ? 'Replace all items in the playlist with the resulting tracks'
                      : item.option.value === 'APPEND'
                        ? 'Add the resulting tracks to the end of the playlist'
                        : ''
                }
              >
                <ActionIcon variant='subtle' color='gray'>
                  <QuestionMarkCircledIcon />
                </ActionIcon>
              </Tooltip>
            </Group>
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

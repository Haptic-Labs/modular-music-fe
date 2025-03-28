import {
  Avatar,
  Button,
  Dialog,
  Flex,
  Grid,
  ScrollArea,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes';
import { SpotifyQueries } from '../../queries';
import { IconPlaylist, IconSearch } from '@tabler/icons-react';
import { colors } from '../../theme/colors';
import { useRef, useState } from 'react';
import { Database } from '../../types';

type UserPlaylistSelectionModalContentsProps = {
  hideCreation?: boolean;
  enableQuery?: boolean;
};

export const UserPlaylistSelectionModalContents = ({
  hideCreation, // TODO: add creation
  enableQuery,
}: UserPlaylistSelectionModalContentsProps) => {
  const [selectedOutput, setSelectedOutput] = useState<string>();
  const [selectedMode, setSelectedMode] =
    useState<Database['public']['Enums']['MODULE_OUTPUT_MODE']>();
  const [searchText, setSearchText] = useState('');
  const modeSelectRef = useRef<HTMLButtonElement>(null);

  const { data: playlists = [] } = SpotifyQueries.useUserPlaylists({
    enabled: enableQuery,
    select: (data) => {
      return data.filter((playlist) =>
        playlist.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    },
  });

  const handleOutputSelect = (id?: string) => {
    if (id) {
      modeSelectRef.current?.click();
    }
    setSelectedOutput(id);
  };

  return (
    <Dialog.Content
      maxHeight='min(700px, 90vh)'
      minHeight='min(700px, 90vh)'
      css={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        gap: 12,
      }}
    >
      <Dialog.Title css={{ flexShrink: 0, marginBottom: 0 }}>
        Select an Output:
      </Dialog.Title>
      <TextField.Root
        placeholder='Search your playlists...'
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        css={{ flexShrink: 0 }}
      >
        <TextField.Slot>
          <IconSearch />
        </TextField.Slot>
      </TextField.Root>
      <ScrollArea css={{ flexGrow: 1 }}>
        <Grid columns='2' gap='2'>
          {playlists.map((playlist) => {
            return (
              <Button
                variant={selectedOutput === playlist.id ? 'solid' : 'soft'}
                color={selectedOutput === playlist.id ? 'green' : 'gray'}
                key={playlist.id}
                size='3'
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
                onClick={() => handleOutputSelect(playlist.id)}
              >
                <Avatar
                  src={playlist.images?.[0]?.url}
                  fallback={<IconPlaylist color={colors.greenDark.green10} />}
                  css={{ backgroundColor: colors.grayDark.gray2 }}
                />
                <Text wrap='nowrap' truncate>
                  {playlist.name}
                </Text>
              </Button>
            );
          })}
        </Grid>
      </ScrollArea>
      <Flex justify='end' css={{ flexShrink: 0, gap: 8 }}>
        <Select.Root
          value={selectedMode}
          onValueChange={(value) =>
            setSelectedMode(
              value as Database['public']['Enums']['MODULE_OUTPUT_MODE'],
            )
          }
        >
          <Select.Trigger placeholder='Select a mode...' ref={modeSelectRef} />
          <Select.Content position='popper' side='top'>
            <Select.Item
              value={'PREPEND' satisfies typeof selectedMode}
              title='Add the resulting tracks to the beginning of the playlist'
            >
              Prepend
            </Select.Item>
            <Select.Item
              value={'REPLACE' satisfies typeof selectedMode}
              title='Replace all items in the pleylist with the resulting tracks'
            >
              Replace
            </Select.Item>
            <Select.Item
              value={'APPEND' satisfies typeof selectedMode}
              title='Add the resulting tracks to the end of the playlist'
            >
              Append
            </Select.Item>
          </Select.Content>
        </Select.Root>
        <Button disabled={!selectedOutput || !selectedMode}>Save</Button>
      </Flex>
    </Dialog.Content>
  );
};

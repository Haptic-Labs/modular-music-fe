import { useState } from 'react';
import { Database } from '../../../types';
import {
  Dialog,
  Grid,
  IconButton,
  ScrollArea,
  TextField,
  Text,
  Flex,
  Button,
  Popover,
  CheckboxGroup,
} from '@radix-ui/themes';
import {
  ArrowLeftIcon,
  ClockIcon,
  Cross1Icon,
  HeartFilledIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
} from '@radix-ui/react-icons';
import { useDebouncedValue } from '@mantine/hooks';
import { useSearchQuery } from '../../../queries/spotify';
import { FilterConfigModalSourceButton } from './filter-config-modal-source-button';
import { ItemType } from '@soundify/web-api';
import { ALL_ITEM_TYPES } from '../../../queries/spotify/constants';
import { titleCase } from '../../../utils';
import { colors } from '../../../theme/colors';
import { AnimatePresence, motion } from 'motion/react';

type FilterActionConfigModalProps = {
  onSave: (
    sources: Database['public']['Functions']['UpsertModuleActionFilter']['Args']['sources'],
  ) => void;
};

export const FilterActionConfigModal = () => {
  const [selectedSources, setSelectedSources] = useState<
    Database['public']['Functions']['UpsertModuleActionFilter']['Args']['sources']
  >([]);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, cancelDebounce] = useDebouncedValue(
    searchText,
    300,
  );
  const [selectedType, setSelectedType] = useState<ItemType>();
  const [filteredTypes, setFilteredTypes] =
    useState<ItemType[]>(ALL_ITEM_TYPES);

  const spotifySearchQuery = useSearchQuery(
    {
      query: debouncedSearchText,
      type:
        filteredTypes.length === 0 ||
        filteredTypes.length === ALL_ITEM_TYPES.length
          ? undefined
          : filteredTypes,
    },
    { enabled: !!debouncedSearchText },
  );

  return (
    <Dialog.Content
      maxHeight='90vh'
      maxWidth='none'
      minWidth='min(600px, 90vw)'
      width='fit-content'
      css={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <Flex>
        <div css={{ flexGrow: 1 }}>
          <Dialog.Title as='h3' size='4' css={{ height: 20 }}>
            Select Filter Sources:
          </Dialog.Title>
          <Grid
            columns='2'
            gap='2'
            css={{
              paddingBottom: 12,
              marginBottom: 12,
              borderBottom: `solid 1px ${colors.grayDark.gray6}`,
            }}
          >
            <FilterConfigModalSourceButton
              imageSrc={
                <HeartFilledIcon
                  color='white'
                  css={{ width: '65%', height: '65%' }}
                />
              }
              title='My Liked Songs'
              onClick={() => {
                setSelectedSources((prev) => [
                  ...prev,
                  {
                    id: prev.length.toString(),
                    spotify_id: null,
                    source_type: 'LIKED_SONGS' as const,
                    image_url: null,
                    limit: null,
                    action_id: null,
                    title: 'My Liked Songs',
                  },
                ]);
              }}
            />
            <FilterConfigModalSourceButton
              imageSrc={
                <ClockIcon
                  color='white'
                  css={{ width: '65%', height: '65%' }}
                />
              }
              title='My Recently Listened'
            />
          </Grid>
          <TextField.Root
            placeholder='Search Spotify for more sources...'
            value={searchText}
            onChange={(e) => setSearchText(e.currentTarget.value)}
            css={{ flexShrink: 0, marginBottom: 8 }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
            <TextField.Slot px='0' css={{ marginRight: 4 }}>
              <Popover.Root>
                <Popover.Trigger>
                  <IconButton
                    variant={
                      // filteredTypes.length === 0 ||
                      // filteredTypes.length === ALL_ITEM_TYPES.length
                      //   ? 'soft'
                      'ghost'
                    }
                    size='1'
                    css={{ margin: 0 }}
                    color={
                      filteredTypes.length === 0 ||
                      filteredTypes.length === ALL_ITEM_TYPES.length
                        ? 'gray'
                        : undefined
                    }
                  >
                    <MixerHorizontalIcon />
                  </IconButton>
                </Popover.Trigger>
                <Popover.Content>
                  <Flex direction='column'>
                    <CheckboxGroup.Root
                      value={filteredTypes}
                      onValueChange={(newVal) =>
                        setFilteredTypes(newVal as ItemType[])
                      }
                    >
                      {ALL_ITEM_TYPES.map((type) => (
                        <CheckboxGroup.Item value={type} key={type + 'option'}>
                          {titleCase(type + 's')}
                        </CheckboxGroup.Item>
                      ))}
                    </CheckboxGroup.Root>
                  </Flex>
                </Popover.Content>
              </Popover.Root>
            </TextField.Slot>
            <TextField.Slot px='0'>
              <IconButton
                variant='ghost'
                color='gray'
                onClick={() => setSearchText('')}
                css={{ margin: 0 }}
              >
                <Cross1Icon />
              </IconButton>
            </TextField.Slot>
          </TextField.Root>
          <ScrollArea
            scrollbars='vertical'
            css={{
              height: '100%',
              maxWidth: 'min(550px, 85vw)',
            }}
          >
            {!!spotifySearchQuery.data?.playlists?.items.length &&
              (selectedType === 'playlist' || selectedType === undefined) && (
                <>
                  <Flex
                    align='center'
                    justify={selectedType === undefined ? 'between' : 'start'}
                    mb='1'
                    gap='2'
                  >
                    {selectedType === 'playlist' && (
                      <IconButton
                        variant='ghost'
                        css={{ margin: 0 }}
                        onClick={() => setSelectedType(undefined)}
                      >
                        <ArrowLeftIcon />
                      </IconButton>
                    )}
                    <Text as='p' weight='bold'>
                      Playlists
                    </Text>
                    {selectedType === undefined && (
                      <Button
                        css={{ margin: 0 }}
                        variant='ghost'
                        onClick={() => setSelectedType('playlist')}
                      >
                        See All
                      </Button>
                    )}
                  </Flex>
                  <Grid columns='2' gap='2' mb='2'>
                    {spotifySearchQuery.data?.playlists.items
                      .filter(Boolean)
                      .slice(0, selectedType === 'playlist' ? undefined : 6)
                      .map((playlist) => {
                        if (!playlist) return null;
                        const owners = playlist.owner.display_name ?? undefined;
                        return (
                          <FilterConfigModalSourceButton
                            key={playlist.id}
                            imageSrc={playlist.images[0]?.url ?? ''}
                            title={playlist.name}
                            subtitle={owners}
                          />
                        );
                      })}
                  </Grid>
                </>
              )}
            {!!spotifySearchQuery.data?.artists?.items.length &&
              (selectedType === 'artist' || selectedType === undefined) && (
                <>
                  <Flex
                    align='center'
                    justify={selectedType === undefined ? 'between' : 'start'}
                    mb='1'
                    gap='2'
                  >
                    {selectedType === 'artist' && (
                      <IconButton
                        variant='ghost'
                        css={{ margin: 0 }}
                        onClick={() => setSelectedType(undefined)}
                      >
                        <ArrowLeftIcon />
                      </IconButton>
                    )}
                    <Text as='p' weight='bold'>
                      Artists
                    </Text>
                    {selectedType === undefined && (
                      <Button
                        css={{ margin: 0 }}
                        variant='ghost'
                        onClick={() => setSelectedType('artist')}
                      >
                        See All
                      </Button>
                    )}
                  </Flex>
                  <Grid columns='2' gap='2' mb='2'>
                    {spotifySearchQuery.data?.artists.items
                      .filter(Boolean)
                      .slice(0, selectedType === 'artist' ? undefined : 6)
                      .map((artist) => {
                        if (!artist) return null;

                        return (
                          <FilterConfigModalSourceButton
                            key={artist.id}
                            imageSrc={artist.images[0]?.url ?? ''}
                            title={artist.name}
                            subtitle={`${artist.followers.total.toLocaleString()} Followers`}
                          />
                        );
                      })}
                  </Grid>
                </>
              )}

            {!!spotifySearchQuery.data?.albums?.items.length &&
              (selectedType === 'album' || selectedType === undefined) && (
                <>
                  <Flex
                    align='center'
                    justify={selectedType === undefined ? 'between' : 'start'}
                    mb='1'
                    gap='2'
                  >
                    {selectedType === 'album' && (
                      <IconButton
                        variant='ghost'
                        css={{ margin: 0 }}
                        onClick={() => setSelectedType(undefined)}
                      >
                        <ArrowLeftIcon />
                      </IconButton>
                    )}
                    <Text as='p' weight='bold'>
                      Albums
                    </Text>
                    {selectedType === undefined && (
                      <Button
                        css={{ margin: 0 }}
                        variant='ghost'
                        onClick={() => setSelectedType('album')}
                      >
                        See All
                      </Button>
                    )}
                  </Flex>
                  <Grid columns='2' gap='2' mb='2'>
                    {spotifySearchQuery.data?.albums.items
                      .filter(Boolean)
                      .slice(0, selectedType === 'album' ? undefined : 6)
                      .map((album) => {
                        if (!album) return null;
                        const artists = album.artists
                          .map((artist) => artist.name)
                          .join(', ');
                        return (
                          <FilterConfigModalSourceButton
                            key={album.id}
                            imageSrc={album.images[0]?.url}
                            title={album.name}
                            subtitle={artists}
                          />
                        );
                      })}
                  </Grid>
                </>
              )}
            {!!spotifySearchQuery.data?.tracks?.items.length &&
              (selectedType === 'track' || selectedType === undefined) && (
                <>
                  <Flex
                    align='center'
                    justify={selectedType === undefined ? 'between' : 'start'}
                    mb='1'
                    gap='2'
                  >
                    {selectedType === 'track' && (
                      <IconButton
                        variant='ghost'
                        css={{ margin: 0 }}
                        onClick={() => setSelectedType(undefined)}
                      >
                        <ArrowLeftIcon />
                      </IconButton>
                    )}
                    <Text as='p' weight='bold'>
                      Tracks
                    </Text>
                    {selectedType === undefined && (
                      <Button
                        css={{ margin: 0 }}
                        variant='ghost'
                        onClick={() => setSelectedType('track')}
                      >
                        See All
                      </Button>
                    )}
                  </Flex>
                  <Grid columns='2' gap='2' mb='2'>
                    {spotifySearchQuery.data?.tracks.items
                      .filter(Boolean)
                      .slice(0, selectedType === 'track' ? undefined : 6)
                      .map((track) => {
                        if (!track) return null;
                        const artists = track.artists
                          .map((artist) => artist.name)
                          .join(', ');
                        return (
                          <FilterConfigModalSourceButton
                            key={track.id}
                            imageSrc={track.album.images[0]?.url}
                            title={track.name}
                            subtitle={artists}
                          />
                        );
                      })}
                  </Grid>
                </>
              )}
          </ScrollArea>
        </div>
        <AnimatePresence>
          {!!selectedSources.length && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              exit={{ width: 0 }}
              css={{
                marginLeft: 12,
                paddingLeft: 12,
                borderLeft: `solid 1px ${colors.grayDark.gray7}`,
                overflow: 'hidden',
              }}
            >
              <Text
                as='p'
                wrap='nowrap'
                size='4'
                weight='bold'
                mb='2'
                css={{ lineHeight: '24px' }}
              >
                Selected Sources:
              </Text>
              <Flex direction='column' gap='2'>
                {selectedSources.map((source) => (
                  <FilterConfigModalSourceButton
                    key={source.id}
                    title={source.title ?? ''}
                    imageSrc={
                      source.source_type === 'LIKED_SONGS' ? (
                        <HeartFilledIcon
                          color='white'
                          css={{ width: '65%', height: '65%' }}
                        />
                      ) : source.source_type === 'RECENTLY_PLAYED' ? (
                        <ClockIcon
                          color='white'
                          css={{ width: '65%', height: '65%' }}
                        />
                      ) : (
                        source.image_url
                      )
                    }
                  />
                ))}
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>
      </Flex>
    </Dialog.Content>
  );
};

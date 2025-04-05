import { useEffect, useRef, useState } from 'react';
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
  Spinner,
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
import { ItemType } from '@soundify/web-api';
import { AnimatePresence, motion } from 'motion/react';
import { keepPreviousData } from '@tanstack/react-query';
import { ALL_ITEM_TYPES } from '../../../queries/spotify/constants';
import { useSearchQuery } from '../../../queries/spotify';
import { colors } from '../../../theme/colors';
import { RecentlyListenedConfigPopover } from '../../popovers';
import { titleCase } from '../../../utils';
import { FilterActionSelectedSourceCard } from '../../actions/config-modals/filter-action-selected-source-card';
import { Database, RecentlyListenedConfig } from '../../../types';
import { SpotifyQueries } from '../../../queries';
import { SpotifySourceButton } from './spotify-source-button';

const MotionDialogContent = motion(Dialog.Content);

type BaseSelectedSource = {
  spotify_id?: string;
  image_url?: string;
  title: string;
  // limit?: number; // TODO: implement limit later, because noone cares right now
  subtitle?: string;
};

export type SelectedSource = BaseSelectedSource &
  (
    | {
        source_type: 'RECENTLY_PLAYED';
        recently_listened_config: RecentlyListenedConfig;
      }
    | {
        source_type: Exclude<
          Database['public']['Enums']['SPOTIFY_SOURCE_TYPE'],
          'RECENTLY_PLAYED'
        >;
        recently_listened_config?: never;
      }
  );

type SourceSelectionModalProps = {
  initialSelectedSources?: SelectedSource[];
  onSave: (sources: SelectedSource[]) => void;
  onCancel: () => void;
  isSaving?: boolean;
  title?: string;
  isOpen: boolean;
};

export const SourceSelectionModal = ({
  initialSelectedSources,
  onSave,
  onCancel,
  isSaving,
  title = 'Select Sources',
  isOpen,
}: SourceSelectionModalProps) => {
  const [lastResultCount, setLastResultCount] = useState(0);
  const [selectedSources, setSelectedSources] = useState<SelectedSource[]>(
    initialSelectedSources ?? [],
  );
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText] = useDebouncedValue(searchText, 300);
  const [selectedType, setSelectedType] = useState<ItemType>();
  const [filteredSourceTypes, setFilteredSourceTypes] =
    useState<ItemType[]>(ALL_ITEM_TYPES);
  const [recentlyListenedConfigIsOpen, setRecentlyListenedConfigIsOpen] =
    useState(false);

  const textFieldRef = useRef<HTMLInputElement>(null);

  const { data: likedSongsLength, isLoading: likedSongsLengthIsLoading } =
    SpotifyQueries.useLikedSongsLength();

  const spotifySearchQuery = useSearchQuery(
    {
      query: debouncedSearchText,
      type:
        filteredSourceTypes.length === 0 ||
        filteredSourceTypes.length === ALL_ITEM_TYPES.length
          ? undefined
          : filteredSourceTypes,
    },
    {
      enabled: !!debouncedSearchText,
      placeholderData:
        searchText && lastResultCount !== 0 ? keepPreviousData : undefined,
      select: (data) => {
        const entries = Object.entries(data);
        const fixedEntries = entries.map(([key, value]) => [
          key,
          {
            ...value,
            items: value.items.filter(
              (item) =>
                item !== null &&
                !selectedSources.some(
                  (source) => source.spotify_id === item.id,
                ),
            ),
          },
        ]);

        return Object.fromEntries(fixedEntries) as typeof data;
      },
    },
  );

  const totalSearchedSources = spotifySearchQuery.data?.playlists?.items.length;
  const showLoader =
    (searchText !== debouncedSearchText && !!searchText) ||
    spotifySearchQuery.isFetching;
  const showOnlyLoader = showLoader && !totalSearchedSources;

  useEffect(() => {
    setLastResultCount(totalSearchedSources ?? 0);
  }, [totalSearchedSources]);

  useEffect(() => {
    setSelectedSources(initialSelectedSources ?? []);
  }, [JSON.stringify(initialSelectedSources)]);

  useEffect(() => {
    if (!isOpen) {
      setSearchText('');
    }
  }, [isOpen]);

  return (
    <MotionDialogContent
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
      initial={{
        height: showOnlyLoader || !totalSearchedSources ? 650 : 'auto',
        minHeight: showOnlyLoader || !totalSearchedSources ? 650 : 'none',
      }}
      animate={{
        height: showOnlyLoader || !totalSearchedSources ? 650 : 'auto',
        minHeight: showOnlyLoader || !totalSearchedSources ? 650 : 'none',
      }}
    >
      <Flex height='100%'>
        <Flex css={{ flexGrow: 1 }} direction='column'>
          <Dialog.Title as='h3' size='4' css={{ height: 20 }}>
            {title}
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
            <SpotifySourceButton
              imageSrc={
                <HeartFilledIcon
                  color='white'
                  css={{ width: '65%', height: '65%' }}
                />
              }
              title='My Liked Songs'
              subtitle={
                likedSongsLength
                  ? `${likedSongsLength.toLocaleString()} Songs`
                  : undefined
              }
              onClick={() => {
                setSelectedSources((prev) => [
                  ...prev,
                  {
                    source_type: 'LIKED_SONGS',
                    title: 'My Liked Songs',
                    subtitle:
                      likedSongsLength === undefined
                        ? undefined
                        : `${likedSongsLength.toLocaleString()} Songs`,
                  },
                ]);
              }}
              disabled={selectedSources.some(
                (source) => source.source_type === 'LIKED_SONGS',
              )}
            />
            <Popover.Root
              open={recentlyListenedConfigIsOpen}
              onOpenChange={(isOpen) => setRecentlyListenedConfigIsOpen(isOpen)}
            >
              <Popover.Trigger>
                <SpotifySourceButton
                  imageSrc={
                    <ClockIcon
                      color='white'
                      css={{ width: '65%', height: '65%' }}
                    />
                  }
                  title='My Recently Listened'
                  disabled={selectedSources.some(
                    (source) => source.source_type === 'RECENTLY_PLAYED',
                  )}
                />
              </Popover.Trigger>
              <RecentlyListenedConfigPopover
                onSave={(config) => {
                  setSelectedSources((prev) => {
                    return [
                      ...prev,
                      {
                        source_type: 'RECENTLY_PLAYED',
                        title: 'My Recently Listened',
                        subtitle: `${config.quantity.toLocaleString()} ${titleCase(config.interval)}`,
                        recently_listened_config: {
                          interval: config.interval,
                          quantity: config.quantity,
                        },
                      },
                    ];
                  });
                  setRecentlyListenedConfigIsOpen(false);
                }}
              />
            </Popover.Root>
          </Grid>
          <TextField.Root
            ref={textFieldRef}
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
                    variant={'ghost'}
                    size='1'
                    css={{ margin: 0 }}
                    color={
                      filteredSourceTypes.length === 0 ||
                      filteredSourceTypes.length === ALL_ITEM_TYPES.length
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
                      value={filteredSourceTypes}
                      onValueChange={(newVal) =>
                        setFilteredSourceTypes(newVal as ItemType[])
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
                onClick={() => {
                  setSearchText('');
                  textFieldRef.current?.focus();
                }}
                css={{ margin: 0 }}
              >
                <Cross1Icon />
              </IconButton>
            </TextField.Slot>
          </TextField.Root>
          {!totalSearchedSources || showOnlyLoader ? (
            <div
              css={{
                paddingTop: '45%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {showLoader ? (
                <Spinner size='3' />
              ) : (
                <Text as='p' color='gray'>
                  No search results to display
                </Text>
              )}
            </div>
          ) : (
            <ScrollArea
              scrollbars='vertical'
              css={{
                maxWidth: 'min(550px, 85vw)',
                position: 'relative',
                flexGrow: 1,
                height: 'auto',
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
                      {selectedType === undefined &&
                        spotifySearchQuery.data?.playlists?.items.filter(
                          Boolean,
                        ).length > 6 && (
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
                        .slice(0, selectedType === 'playlist' ? undefined : 6)
                        .map((playlist) => {
                          if (!playlist) return null;
                          const owners =
                            playlist.owner.display_name ?? undefined;
                          return (
                            <SpotifySourceButton
                              key={playlist.id}
                              imageSrc={playlist.images[0]?.url ?? ''}
                              title={playlist.name}
                              subtitle={owners}
                              onClick={() => {
                                setSelectedSources((prev) => [
                                  ...prev,
                                  {
                                    id: playlist.id,
                                    source_type: 'PLAYLIST',
                                    image_url: playlist.images[0]?.url ?? '',
                                    title: playlist.name,
                                    subtitle: owners,
                                    action_id: null,
                                    spotify_id: playlist.id,
                                    limit: null,
                                  },
                                ]);
                              }}
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
                      {selectedType === undefined &&
                        spotifySearchQuery.data?.artists?.items.filter(Boolean)
                          .length > 6 && (
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
                        .slice(0, selectedType === 'artist' ? undefined : 6)
                        .map((artist) => {
                          if (!artist) return null;

                          const subtitle = `${artist.followers.total.toLocaleString()} Followers`;

                          return (
                            <SpotifySourceButton
                              key={artist.id}
                              imageSrc={artist.images[0]?.url ?? ''}
                              title={artist.name}
                              subtitle={subtitle}
                              onClick={() => {
                                setSelectedSources((prev) => [
                                  ...prev,
                                  {
                                    id: artist.id,
                                    source_type: 'ARTIST',
                                    image_url: artist.images[0]?.url ?? '',
                                    title: artist.name,
                                    subtitle,
                                    action_id: null,
                                    spotify_id: artist.id,
                                    limit: null,
                                  },
                                ]);
                              }}
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
                      {selectedType === undefined &&
                        spotifySearchQuery.data?.albums?.items.filter(Boolean)
                          .length > 6 && (
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
                        .slice(0, selectedType === 'album' ? undefined : 6)
                        .map((album) => {
                          if (!album) return null;
                          const artists = album.artists
                            .map((artist) => artist.name)
                            .join(', ');
                          return (
                            <SpotifySourceButton
                              key={album.id}
                              imageSrc={album.images[0]?.url}
                              title={album.name}
                              subtitle={artists}
                              onClick={() => {
                                setSelectedSources((prev) => [
                                  ...prev,
                                  {
                                    id: album.id,
                                    source_type: 'ALBUM',
                                    image_url: album.images[0]?.url ?? '',
                                    title: album.name,
                                    subtitle: artists,
                                    action_id: null,
                                    spotify_id: album.id,
                                    limit: null,
                                  },
                                ]);
                              }}
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
                      {selectedType === undefined &&
                        spotifySearchQuery.data?.tracks.items.length > 6 && (
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
                        .slice(0, selectedType === 'track' ? undefined : 6)
                        .map((track) => {
                          if (!track) return null;
                          const artists = track.artists
                            .map((artist) => artist.name)
                            .join(', ');
                          return (
                            <SpotifySourceButton
                              key={track.id}
                              imageSrc={track.album.images[0]?.url}
                              title={track.name}
                              subtitle={artists}
                              onClick={() => {
                                setSelectedSources((prev) => [
                                  ...prev,
                                  {
                                    id: track.id,
                                    source_type: 'TRACK',
                                    image_url: track.album.images[0]?.url ?? '',
                                    title: track.name,
                                    subtitle: artists,
                                    action_id: null,
                                    spotify_id: track.id,
                                    limit: null,
                                  },
                                ]);
                              }}
                            />
                          );
                        })}
                    </Grid>
                  </>
                )}
              <AnimatePresence>
                {showLoader && (
                  <motion.div
                    css={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: colors.grayA.grayA10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'progress',
                    }}
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Spinner size='3' />
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          )}
        </Flex>
        <AnimatePresence>
          {!!selectedSources.length && (
            <motion.div
              initial={
                initialSelectedSources?.length
                  ? {
                      width: 'auto',
                      marginLeft: 12,
                      paddingLeft: 12,
                      opacity: 1,
                    }
                  : { width: 0, marginLeft: 0, paddingLeft: 0, opacity: 1 }
              }
              animate={{
                width: 'auto',
                marginLeft: 12,
                paddingLeft: 12,
                opacity: 1,
              }}
              exit={{ width: 0, marginLeft: 0, paddingLeft: 0, opacity: 0 }}
              css={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                borderLeft: `solid 1px ${colors.grayDark.gray7}`,
                overflow: 'hidden',
              }}
            >
              <Text
                as='p'
                wrap='nowrap'
                size='4'
                weight='bold'
                css={{ lineHeight: '24px' }}
              >
                Selected Sources:
              </Text>
              <Flex
                direction='column'
                gap='2'
                justify='between'
                css={{
                  flexGrow: 1,
                }}
              >
                <ScrollArea
                  scrollbars='vertical'
                  css={{
                    flexGrow: 1,
                  }}
                >
                  <AnimatePresence>
                    {selectedSources.map((source) => (
                      <FilterActionSelectedSourceCard // TODO: also make this card generic
                        key={`${source.source_type}-${source.spotify_id ?? ''}`}
                        title={source.title ?? ''}
                        subtitle={source.subtitle}
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
                        onRemove={() => {
                          setSelectedSources((prev) =>
                            prev.filter(
                              (selectedSource) =>
                                !(
                                  selectedSource.spotify_id ===
                                    source.spotify_id &&
                                  selectedSource.source_type ===
                                    source.source_type
                                ),
                            ),
                          );
                        }}
                        css={{
                          width: 250,
                          marginBottom: 8,
                        }}
                        layout='position'
                      />
                    ))}
                  </AnimatePresence>
                </ScrollArea>
                <Flex height='fit-content' minHeight='32px' justify='end'>
                  <Button variant='outline' color='gray' onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button
                    disabled={
                      selectedSources.length === 0 ||
                      (initialSelectedSources &&
                        selectedSources.every((source) =>
                          initialSelectedSources?.some(
                            (initialSource) =>
                              initialSource.spotify_id === source.spotify_id &&
                              initialSource.source_type === source.source_type,
                          ),
                        ))
                    }
                    loading={isSaving}
                    onClick={() => {
                      onSave(selectedSources);
                    }}
                  >
                    Save
                  </Button>
                </Flex>
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>
      </Flex>
    </MotionDialogContent>
  );
};

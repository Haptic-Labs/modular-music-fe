import { useEffect, useMemo, useRef, useState } from 'react';
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
import { RecentlyListenedConfigPopover } from '../../popovers';
import { titleCase } from '../../../utils';
import { Database, RecentlyListenedConfig } from '../../../types';
import { SpotifyQueries } from '../../../queries';
import { SpotifySourceButton } from './spotify-source-button';
import {
  ActionIcon,
  Checkbox,
  Flex,
  Grid,
  Group,
  Loader,
  Modal,
  ModalProps,
  Popover,
  TextInput,
  Title,
  Text,
  ScrollArea,
  Button,
} from '@mantine/core';

const MotionSpotifySourceButton = motion(SpotifySourceButton);

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
} & ModalProps;

export const SourceSelectionModal = ({
  initialSelectedSources,
  onSave,
  onCancel,
  isSaving,
  title = 'Select Sources',
  isOpen,
  ...modalProps
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

  const {
    data: likedSongsLength,
    // isLoading: likedSongsLengthIsLoading
  } = SpotifyQueries.useLikedSongsLength();

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

  const totalSearchedSources = useMemo(() => {
    return Object.values(spotifySearchQuery.data ?? {}).reduce(
      (acc, curr) => acc + curr.items.length,
      0,
    );
  }, [spotifySearchQuery.data]);
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
    <Modal {...modalProps}>
      <motion.div
        css={{
          width: 'fit-content',
          minWidth: 'min(600px, 90vw)',
          maxWidth: 'none',
          maxHeight: '90vh',
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
        <Flex h='100%'>
          <Flex css={{ flexGrow: 1 }} direction='column'>
            <Title order={3} css={{ height: 20 }}>
              {title}
            </Title>
            <Grid
              columns={2}
              gutter='md'
              css={(theme) => ({
                paddingBottom: 12,
                marginBottom: 12,
                borderBottom: `solid 1px ${theme.colors.gray[6]}`,
              })}
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
              <RecentlyListenedConfigPopover
                opened={recentlyListenedConfigIsOpen}
                onChange={(isOpen) => setRecentlyListenedConfigIsOpen(isOpen)}
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
            </Grid>
            <TextInput
              ref={textFieldRef}
              placeholder='Search Spotify for more sources...'
              value={searchText}
              onChange={(e) => setSearchText(e.currentTarget.value)}
              css={{ flexShrink: 0, marginBottom: 8 }}
              leftSection={<MagnifyingGlassIcon />}
              rightSection={
                <Group gap='sm'>
                  <ActionIcon
                    variant={'ghost'}
                    css={{ margin: 0 }}
                    color={
                      filteredSourceTypes.length === 0 ||
                      filteredSourceTypes.length === ALL_ITEM_TYPES.length
                        ? 'gray'
                        : undefined
                    }
                  >
                    <MixerHorizontalIcon />
                  </ActionIcon>
                  <Popover>
                    <Flex direction='column'>
                      <Checkbox.Group
                        value={filteredSourceTypes}
                        onChange={(newVal) =>
                          setFilteredSourceTypes(newVal as ItemType[])
                        }
                      >
                        {ALL_ITEM_TYPES.map((type) => (
                          <Checkbox
                            value={type}
                            key={type + 'option'}
                            label={titleCase(type + 's')}
                          />
                        ))}
                      </Checkbox.Group>
                    </Flex>
                  </Popover>
                  <ActionIcon
                    variant='ghost'
                    color='gray'
                    onClick={() => {
                      setSearchText('');
                      textFieldRef.current?.focus();
                    }}
                    css={{ margin: 0 }}
                  >
                    <Cross1Icon />
                  </ActionIcon>
                </Group>
              }
            ></TextInput>
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
                  <Loader />
                ) : (
                  <Text c='gray'>No search results to display</Text>
                )}
              </div>
            ) : (
              <ScrollArea
                scrollbars='y'
                css={{
                  maxWidth: 'min(550px, 85vw)',
                  position: 'relative',
                  flexGrow: 1,
                  height: 'auto',
                }}
              >
                {!!spotifySearchQuery.data?.playlists?.items.length &&
                  (selectedType === 'playlist' ||
                    selectedType === undefined) && (
                    <>
                      <Flex
                        align='center'
                        justify={
                          selectedType === undefined ? 'between' : 'start'
                        }
                        mb='1'
                        gap='2'
                      >
                        {selectedType === 'playlist' && (
                          <ActionIcon
                            variant='ghost'
                            css={{ margin: 0 }}
                            onClick={() => setSelectedType(undefined)}
                          >
                            <ArrowLeftIcon />
                          </ActionIcon>
                        )}
                        <Text css={{ fontWeight: 'bold' }}>Playlists</Text>
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
                      <Grid columns={2} gutter='md' mb='2'>
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
                        justify={
                          selectedType === undefined ? 'between' : 'start'
                        }
                        mb='1'
                        gap='2'
                      >
                        {selectedType === 'artist' && (
                          <ActionIcon
                            variant='ghost'
                            css={{ margin: 0 }}
                            onClick={() => setSelectedType(undefined)}
                          >
                            <ArrowLeftIcon />
                          </ActionIcon>
                        )}
                        <Text css={{ fontWeight: 'bold' }}>Artists</Text>
                        {selectedType === undefined &&
                          spotifySearchQuery.data?.artists?.items.filter(
                            Boolean,
                          ).length > 6 && (
                            <Button
                              css={{ margin: 0 }}
                              variant='ghost'
                              onClick={() => setSelectedType('artist')}
                            >
                              See All
                            </Button>
                          )}
                      </Flex>
                      <Grid columns={2} gutter='md' mb='2'>
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
                        justify={
                          selectedType === undefined ? 'between' : 'start'
                        }
                        mb='1'
                        gap='2'
                      >
                        {selectedType === 'album' && (
                          <ActionIcon
                            variant='ghost'
                            css={{ margin: 0 }}
                            onClick={() => setSelectedType(undefined)}
                          >
                            <ArrowLeftIcon />
                          </ActionIcon>
                        )}
                        <Text css={{ fontWeight: 'bold' }}>Albums</Text>
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
                      <Grid columns={2} gutter='md' mb='2'>
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
                        justify={
                          selectedType === undefined ? 'between' : 'start'
                        }
                        mb='1'
                        gap='2'
                      >
                        {selectedType === 'track' && (
                          <ActionIcon
                            variant='ghost'
                            css={{ margin: 0 }}
                            onClick={() => setSelectedType(undefined)}
                          >
                            <ArrowLeftIcon />
                          </ActionIcon>
                        )}
                        <Text css={{ fontWeight: 'bold' }}>Tracks</Text>
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
                      <Grid columns={2} gutter='md' mb='2'>
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
                                      image_url:
                                        track.album.images[0]?.url ?? '',
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
                      css={(theme) => ({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: theme.colors.gray[4],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'progress',
                      })}
                      initial={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader />
                    </motion.div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            )}
          </Flex>
          <AnimatePresence>
            {!!selectedSources.length && (
              <motion.div
                initial={{
                  width: 0,
                  marginLeft: 0,
                  paddingLeft: 0,
                  opacity: 1,
                }}
                animate={{
                  width: 'auto',
                  marginLeft: 12,
                  paddingLeft: 12,
                  opacity: 1,
                }}
                exit={{ width: 0, marginLeft: 0, paddingLeft: 0, opacity: 0 }}
                css={(theme) => ({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  borderLeft: `solid 1px ${theme.colors.gray[6]}`,
                  overflow: 'hidden',
                })}
              >
                <Text
                  css={{
                    fontWeight: 'bold',
                    lineHeight: '24px',
                    textWrap: 'nowrap',
                  }}
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
                    scrollbars='y'
                    css={{
                      flexGrow: 1,
                    }}
                  >
                    <AnimatePresence>
                      {selectedSources.map((source) => (
                        <MotionSpotifySourceButton
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
                  <Flex h='fit-content' mih='32px' justify='end' gap='2'>
                    <Button variant='outline' color='gray' onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button
                      disabled={
                        selectedSources.length === 0 ||
                        (initialSelectedSources &&
                          initialSelectedSources.length ===
                            selectedSources.length &&
                          selectedSources.every((source) =>
                            initialSelectedSources?.some(
                              (initialSource) =>
                                initialSource.spotify_id ===
                                  source.spotify_id &&
                                initialSource.source_type ===
                                  source.source_type,
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
      </motion.div>
    </Modal>
  );
};

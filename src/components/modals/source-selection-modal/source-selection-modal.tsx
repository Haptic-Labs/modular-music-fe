import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ClockIcon,
  Cross1Icon,
  HeartFilledIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
} from '@radix-ui/react-icons';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { ItemType } from '@soundify/web-api';
import { AnimatePresence, motion } from 'motion/react';
import { keepPreviousData } from '@tanstack/react-query';
import { ALL_ITEM_TYPES } from '../../../queries/spotify/constants';
import { useSearchQuery } from '../../../queries/spotify';
import { RecentlyListenedConfigPopover } from '../../popovers';
import { getSpotifySearchResultDisplayData, titleCase } from '../../../utils';
import {
  Database,
  ImplementedItemTypes,
  RecentlyListenedConfig,
  SpotifySearchItem,
} from '../../../types';
import { SpotifyQueries } from '../../../queries';
import { SpotifySourceButton } from './spotify-source-button';
import {
  ActionIcon,
  Checkbox,
  Text,
  Group,
  Modal,
  ModalProps,
  Popover,
  SimpleGrid,
  Skeleton,
  Stack,
  TextInput,
  Title,
  ScrollArea,
  Button,
  Divider,
  LoadingOverlay,
  Center,
  Loader,
} from '@mantine/core';
import { SourceSelectionList } from '../../sources/source-selection-list';

const convertSourceToSelectedSource = (
  source: SpotifySearchItem<ImplementedItemTypes>,
): SelectedSource => {
  const {
    imgSrc: image_url,
    title,
    subtitle,
  } = getSpotifySearchResultDisplayData({
    item: source,
    itemType: source.type,
  });
  switch (source.type) {
    case 'playlist':
      return {
        source_type: 'PLAYLIST',
        spotify_id: source.id,
        image_url,
        title,
        subtitle,
      };
    case 'artist':
      return {
        source_type: 'ARTIST',
        spotify_id: source.id,
        image_url,
        title,
        subtitle,
      };
    case 'album':
      return {
        source_type: 'ALBUM',
        spotify_id: source.id,
        image_url,
        title,
        subtitle,
      };
    case 'track':
      return {
        source_type: 'TRACK',
        spotify_id: source.id,
        image_url,
        title,
        subtitle,
      };
  }
};

const MotionSpotifySourceButton = motion(SpotifySourceButton);
const MotionStack = motion(Stack);

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
  const [selectedType, setSelectedType] = useState<ImplementedItemTypes>();
  const [filteredSourceTypes, setFilteredSourceTypes] =
    useState<ItemType[]>(ALL_ITEM_TYPES);
  const [filterSourceTypesPopoverIsOpen, filterSourceTypesPopoverFns] =
    useDisclosure(false);
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
    <Modal.Root
      size='auto'
      centered
      styles={{ title: { fontSize: 20, fontWeight: 'bold' } }}
      {...modalProps}
    >
      <Modal.Overlay />
      <Modal.Content p='md' css={{ overflow: 'hidden', display: 'flex' }}>
        <Group align='stretch' gap={0}>
          <Stack css={{ height: '100%' }}>
            <Title order={3} mr='xs'>
              {title}
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='xs' mr='xs' h={65}>
              <SpotifySourceButton
                imageSrc={
                  <HeartFilledIcon css={{ width: '65%', height: '65%' }} />
                }
                title='My Liked Songs'
                subtitle={
                  likedSongsLength
                    ? `${likedSongsLength.toLocaleString()} songs`
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
              <Popover
                opened={recentlyListenedConfigIsOpen}
                onChange={setRecentlyListenedConfigIsOpen}
              >
                <Popover.Target>
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
                    onClick={() => setRecentlyListenedConfigIsOpen(true)}
                  />
                </Popover.Target>
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
              </Popover>
            </SimpleGrid>
            <Divider mr='xs' />
            <Stack
              maw='min(550px, 70vw)'
              gap='sm'
              css={{
                flexGrow: 1,
              }}
            >
              <TextInput
                ref={textFieldRef}
                mr='xs'
                mb='xs'
                placeholder='Search Spotify for more sources...'
                value={searchText}
                onChange={(e) => setSearchText(e.currentTarget.value)}
                leftSection={<MagnifyingGlassIcon />}
                rightSectionWidth='auto'
                rightSection={
                  <Group gap={0} wrap='nowrap' px={4}>
                    <Popover
                      opened={filterSourceTypesPopoverIsOpen}
                      onChange={(isOpen) =>
                        isOpen
                          ? filterSourceTypesPopoverFns.open()
                          : filterSourceTypesPopoverFns.close()
                      }
                    >
                      <Popover.Target>
                        <ActionIcon
                          variant='subtle'
                          color='gray'
                          onClick={filterSourceTypesPopoverFns.open}
                        >
                          <MixerHorizontalIcon />
                        </ActionIcon>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <Text size='sm' css={{ fontWeight: 'bold' }} mb={4}>
                          Source Types:
                        </Text>
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
                              mt={4}
                            />
                          ))}
                        </Checkbox.Group>
                      </Popover.Dropdown>
                    </Popover>
                    <ActionIcon
                      variant='subtle'
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
              />
              {totalSearchedSources < 1 || showOnlyLoader ? (
                <Center mih={300}>
                  {showOnlyLoader ? (
                    <Loader />
                  ) : (
                    <Text>No search results to display</Text>
                  )}
                </Center>
              ) : (
                <ScrollArea scrollHideDelay={300} pr='xs'>
                  <LoadingOverlay
                    visible={showLoader}
                    transitionProps={{ exitDelay: 0, exitDuration: 0 }}
                  />
                  <Stack>
                    {(selectedType === undefined ||
                      selectedType === 'playlist') && (
                      <SourceSelectionList<ImplementedItemTypes>
                        sources={
                          spotifySearchQuery.data?.playlists?.items ?? []
                        }
                        onSourceSelect={(source) => {
                          setSelectedSources((prev) => [
                            ...prev,
                            convertSourceToSelectedSource(source),
                          ]);
                        }}
                        title='Playlists:'
                        isExpanded={selectedType === 'playlist'}
                        setIsExpanded={(isExpanded) =>
                          setSelectedType(isExpanded ? 'playlist' : undefined)
                        }
                      />
                    )}
                    {(selectedType === undefined ||
                      selectedType === 'artist') && (
                      <SourceSelectionList<ImplementedItemTypes>
                        sources={spotifySearchQuery.data?.artists?.items ?? []}
                        onSourceSelect={(source) => {
                          setSelectedSources((prev) => [
                            ...prev,
                            convertSourceToSelectedSource(source),
                          ]);
                        }}
                        title='Artists:'
                        isExpanded={selectedType === 'artist'}
                        setIsExpanded={(isExpanded) =>
                          setSelectedType(isExpanded ? 'artist' : undefined)
                        }
                      />
                    )}
                    {(selectedType === undefined ||
                      selectedType === 'album') && (
                      <SourceSelectionList<ImplementedItemTypes>
                        sources={spotifySearchQuery.data?.albums?.items ?? []}
                        onSourceSelect={(source) => {
                          setSelectedSources((prev) => [
                            ...prev,
                            convertSourceToSelectedSource(source),
                          ]);
                        }}
                        title='Albums:'
                        isExpanded={selectedType === 'album'}
                        setIsExpanded={(isExpanded) =>
                          setSelectedType(isExpanded ? 'album' : undefined)
                        }
                      />
                    )}
                    {(selectedType === undefined ||
                      selectedType === 'track') && (
                      <SourceSelectionList<ImplementedItemTypes>
                        sources={spotifySearchQuery.data?.tracks?.items ?? []}
                        onSourceSelect={(source) => {
                          setSelectedSources((prev) => [
                            ...prev,
                            convertSourceToSelectedSource(source),
                          ]);
                        }}
                        title='Tracks:'
                        isExpanded={selectedType === 'track'}
                        setIsExpanded={(isExpanded) =>
                          setSelectedType(isExpanded ? 'track' : undefined)
                        }
                      />
                    )}
                  </Stack>
                </ScrollArea>
              )}
            </Stack>
          </Stack>
          <AnimatePresence>
            {!!selectedSources.length && (
              <MotionStack
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
                exit={{
                  width: 0,
                  marginLeft: 0,
                  paddingLeft: 0,
                  opacity: 0,
                }}
                css={(theme) => ({
                  borderLeft: `solid 1px ${theme.colors.gray[7]}`,
                })}
              >
                <Title order={3} textWrap='nowrap'>
                  Selected Sources:
                </Title>
                <Stack
                  css={{ overflowY: 'auto', overflowX: 'hidden' }}
                  gap={4}
                  flex={1}
                >
                  {selectedSources.map((source) => (
                    <MotionSpotifySourceButton
                      key={`${source.source_type}-${source.spotify_id ?? ''}`}
                      title={source.title ?? ''}
                      subtitle={
                        source.source_type === 'LIKED_SONGS' ? (
                          likedSongsLength === undefined ? (
                            <Skeleton />
                          ) : (
                            `${likedSongsLength.toLocaleString()} songs`
                          )
                        ) : (
                          source.subtitle
                        )
                      }
                      imageSrc={
                        source.source_type === 'LIKED_SONGS' ? (
                          <HeartFilledIcon
                            css={{ width: '65%', height: '65%' }}
                          />
                        ) : source.source_type === 'RECENTLY_PLAYED' ? (
                          <ClockIcon css={{ width: '65%', height: '65%' }} />
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
                    />
                  ))}
                </Stack>
                <Group justify='end'>
                  <Button
                    variant='outline'
                    color='gray'
                    onClick={onCancel}
                    size='sm'
                  >
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
                              initialSource.spotify_id === source.spotify_id &&
                              initialSource.source_type === source.source_type,
                          ),
                        ))
                    }
                    loading={isSaving}
                    onClick={() => {
                      onSave(selectedSources);
                    }}
                    size='sm'
                  >
                    Save
                  </Button>
                </Group>
              </MotionStack>
            )}
          </AnimatePresence>
        </Group>
      </Modal.Content>
    </Modal.Root>
  );
};

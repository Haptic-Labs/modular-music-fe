import {
  Button,
  Dialog,
  TextField,
  ScrollArea,
  Grid,
  Heading,
  Spinner,
  Flex,
  Text,
  IconButton,
  Popover,
} from "@radix-ui/themes";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Database, RecentlyListenedConfig } from "../../types";
import { Cross1Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useDebouncedValue } from "@mantine/hooks";
import { SpotifyQueries } from "../../queries";
import { SpotifyComponents } from "../../ui";
import { getSmallestSpotifyImage } from "../../utils";
import { StaticSourceCard } from "../../ui/spotify";
import { colors } from "../../theme/colors";
import { RecentlyListenedConfigPopover } from "../popovers";

type SpotifySourceSelectionModalProps = {
  searchProps?: {
    searchText: string;
    setSearchText: Dispatch<SetStateAction<string>>;
    filteredSourceTypes: Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"][];
    setFilteredSourceTypes: Dispatch<
      SetStateAction<Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"][]>
    >;
    hideTypeFilter?: boolean;
  };
  singleSelect?: boolean;
  onSelect: (
    sources: Database["public"]["Tables"]["module_sources"]["Insert"][],
  ) => void;
} & Dialog.ContentProps;

export const SpotifySourceSelectionModal = ({
  searchProps,
  singleSelect = true,
  onSelect,
  ...rest
}: SpotifySourceSelectionModalProps) => {
  const [uncontrolledSearchText, setUncontrolledSearchText] = useState("");
  // TODO: handle sources with config
  const [selectedSources, setSelectedSources] = useState<
    Database["public"]["Tables"]["module_sources"]["Insert"][]
  >([]);

  const handleSourceClick = (
    source: Database["public"]["Tables"]["module_sources"]["Insert"],
  ) => {
    if (singleSelect) {
      setSelectedSources((prev) => {
        if (
          prev[0]?.spotify_id === source.spotify_id &&
          prev[0]?.type === source.type
        ) {
          return [];
        } else {
          return [source];
        }
      });
    } else {
      setSelectedSources((prev) => {
        const alreadySelected = prev.some(
          ({ spotify_id, type }) =>
            spotify_id === source.spotify_id && source.type === type,
        );
        if (alreadySelected) {
          return prev.filter(
            ({ spotify_id, type }) =>
              spotify_id !== source.spotify_id && type === source.type,
          );
        } else {
          return [...prev, source];
        }
      });
    }
  };

  const searchText = searchProps?.searchText ?? uncontrolledSearchText;
  const setSearchText = searchProps?.setSearchText ?? setUncontrolledSearchText;

  const [debouncedSearchText] = useDebouncedValue(searchText, 300);

  const searchQuery = SpotifyQueries.useSearchQuery(
    {
      query: debouncedSearchText,
    },
    { enabled: !!debouncedSearchText },
  );
  const [previousSearchResults, setPreviousSearchResults] =
    useState<(typeof searchQuery)["data"]>();

  useEffect(() => {
    if (searchQuery.data) {
      setPreviousSearchResults(searchQuery.data);
    }
  }, [JSON.stringify(searchQuery.data)]);

  useEffect(() => {
    if (!debouncedSearchText) {
      setPreviousSearchResults(undefined);
    }
  }, [debouncedSearchText]);

  const getResultsCount = useCallback(
    (results: (typeof searchQuery)["data"]) => {
      return Object.values(results ?? {}).reduce<number>(
        (acc, curr) => acc + curr.items.length,
        0,
      );
    },
    [],
  );
  const showLoader =
    searchQuery.isLoading ||
    (searchText !== debouncedSearchText && !!searchText);

  const resultsToDisplay = searchQuery.data ?? previousSearchResults;
  const resultsToDisplayCount = useMemo(
    () => getResultsCount(resultsToDisplay),
    [getResultsCount, JSON.stringify(resultsToDisplay)],
  );
  const loaderType = showLoader
    ? resultsToDisplayCount
      ? "overlay"
      : "loader-only"
    : "none";

  return (
    <Dialog.Content
      css={{
        maxHeight: "75vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      {...rest}
    >
      <div css={{ width: "100%", minHeight: "max-content" }}>
        <Dialog.Title>Add Sources</Dialog.Title>
        <Dialog.Description mb="2" color="gray">
          Select sources to add to your module
        </Dialog.Description>
        <Grid
          columns="2"
          gap="2"
          pb="2"
          css={{
            borderBottom: `1px solid ${colors.grayDark.gray7}`,
          }}
        >
          <StaticSourceCard
            type="LIKED_SONGS"
            isSelected={selectedSources.some(
              ({ type }) => type === "LIKED_SONGS",
            )}
            onClick={() => {
              handleSourceClick({
                type: "LIKED_SONGS",
                title: "Liked Songs",
                spotify_id: "",
                image_url: "",
              });
            }}
          />
          <Popover.Root>
            <Popover.Trigger>
              <StaticSourceCard
                type="RECENTLY_PLAYED"
                isSelected={selectedSources.some(
                  ({ type }) => type === "RECENTLY_PLAYED",
                )}
                onClick={() => {
                  handleSourceClick({
                    type: "RECENTLY_PLAYED",
                    title: "Recently Played",
                    spotify_id: "",
                    image_url: "",
                  });
                }}
              />
            </Popover.Trigger>
            <RecentlyListenedConfigPopover
              onSave={(config) => {
                handleSourceClick({
                  type: "RECENTLY_PLAYED",
                  title: "Recently Listened",
                  spotify_id: "",
                  image_url: "",
                });
              }}
            />
          </Popover.Root>
        </Grid>
        <Text as="p" my="2" color="gray">
          Search Spotify for other sources
        </Text>
        {/* TODO: add filter and clear buttons */}
        <TextField.Root
          value={searchText}
          onChange={(e) => setSearchText(e.currentTarget.value)}
          css={{
            width: "100%",
          }}
          placeholder="Type something..."
          mb="2"
        >
          <TextField.Slot side="left">
            <MagnifyingGlassIcon width={16} height={16} />
          </TextField.Slot>
          <TextField.Slot side="right">
            <IconButton
              variant="ghost"
              color="gray"
              css={{
                padding: 4,
              }}
            >
              <Cross1Icon width={16} height={16} />
            </IconButton>
          </TextField.Slot>
          <TextField.Slot side="right">
            <IconButton variant="ghost" color="gray">
              <Cross1Icon width={16} height={16} />
            </IconButton>
          </TextField.Slot>
        </TextField.Root>
      </div>
      <ScrollArea
        scrollbars="vertical"
        css={[
          {
            padding: "8px 0px",
            width: "100%",
            position: "relative",
            ".results": {
              transition: "opacity 300ms ease-in-out",
            },
          },
          loaderType === "overlay" && {
            ".results": {
              opacity: 0.5,
            },
          },
        ]}
      >
        {!resultsToDisplayCount ? (
          <Flex height="300px" justify="center" align="center">
            {loaderType === "loader-only" ? (
              <Spinner size="3" />
            ) : (
              <Text>
                {searchText.length
                  ? "No results to display"
                  : "Type something to search for other sources from Spotify"}
              </Text>
            )}
          </Flex>
        ) : (
          <>
            {!!resultsToDisplay?.tracks.items.length && (
              <>
                <Heading as="h3" className="results" mb="2">
                  Tracks
                </Heading>
                <Grid columns="2" gap="2" className="results">
                  {resultsToDisplay.tracks.items.map((track) => (
                    <SpotifyComponents.SearchResult
                      type="track"
                      item={track}
                      onClick={() => {
                        handleSourceClick({
                          spotify_id: track.id,
                          type: "TRACK",
                          title: track.name,
                          image_url:
                            getSmallestSpotifyImage({
                              images: track.album.images,
                              minimumSize: 50,
                            })?.url ?? "",
                        });
                      }}
                      isSelected={selectedSources.some(
                        (source) => source.spotify_id === track.id,
                      )}
                    />
                  ))}
                </Grid>
              </>
            )}
          </>
        )}
        {loaderType === "overlay" && (
          <Flex
            align="center"
            justify="center"
            top="0"
            bottom="0"
            left="0"
            right="0"
            position="absolute"
          >
            <Spinner size="3" />
          </Flex>
        )}
      </ScrollArea>
      <Dialog.Close
        onClick={() => {
          onSelect(selectedSources);
        }}
      >
        <Button>Select</Button>
      </Dialog.Close>
    </Dialog.Content>
  );
};

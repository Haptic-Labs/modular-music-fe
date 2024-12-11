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
} from "@radix-ui/themes";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Database } from "../../types";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useDebouncedValue } from "@mantine/hooks";
import { SpotifyQueries } from "../../queries";
import { SpotifyComponents } from "../../ui";
import { getSmallestSpotifyImage } from "../../utils";

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
  const [selectedSources, setSelectedSources] = useState<
    Database["public"]["Tables"]["module_sources"]["Insert"][]
  >([]);

  const handleSourceClick = (
    source: Database["public"]["Tables"]["module_sources"]["Insert"],
  ) => {
    if (singleSelect) {
      setSelectedSources((prev) => {
        if (prev[0]?.spotify_id === source.spotify_id) {
          return [];
        } else {
          return [source];
        }
      });
    } else {
      setSelectedSources((prev) => {
        const alreadySelected = prev.some(
          ({ spotify_id }) => spotify_id === source.spotify_id,
        );
        if (alreadySelected) {
          return prev.filter(
            ({ spotify_id }) => spotify_id !== source.spotify_id,
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
      console.log("brayden-test", { newData: searchQuery.data });
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
        <Dialog.Description>Search for sources from Spotify</Dialog.Description>
        <TextField.Root
          value={searchText}
          onChange={(e) => setSearchText(e.currentTarget.value)}
          css={{
            width: "100%",
          }}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon width={16} height={16} />
          </TextField.Slot>
        </TextField.Root>
      </div>
      {
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
                    : "Type something to search Spotify"}
                </Text>
              )}
            </Flex>
          ) : (
            <>
              {!!resultsToDisplay?.tracks.items.length && (
                <>
                  <Heading as="h3" mb="2" className="results">
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
      }
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

import {
  Button,
  Dialog,
  TextField,
  ScrollArea,
  Grid,
  Heading,
} from "@radix-ui/themes";
import { Dispatch, SetStateAction, useState } from "react";
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
      <ScrollArea
        scrollbars="vertical"
        css={{
          padding: "8px 0px",
          width: "100%",
        }}
      >
        <Heading as="h3" mb="2">
          Tracks
        </Heading>
        <Grid columns="2" gap="2">
          {searchQuery.data?.tracks.items.map((track) => (
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

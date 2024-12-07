import {
  Button,
  Dialog,
  Flex,
  TextField,
  Text,
  Container,
  ScrollArea,
} from "@radix-ui/themes";
import { Dispatch, SetStateAction, useState } from "react";
import { Database } from "../../types";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useDebouncedValue } from "@mantine/hooks";
import { useSoundify } from "../../providers";
import { SpotifyQueries } from "../../queries";

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
    sources: Database["public"]["Tables"]["module_sources"]["Row"][],
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
    Database["public"]["Tables"]["module_sources"]["Row"][]
  >([]);

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
      <ScrollArea>
        {searchQuery.data?.tracks.items.map((track) => (
          <Text
            css={{
              height: "auto",
              minHeight: 0,
            }}
          >
            {JSON.stringify(track)}
          </Text>
        ))}
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

import { Button, Dialog, Flex, TextField } from "@radix-ui/themes";
import { Dispatch, SetStateAction, useState } from "react";
import { Database } from "../../types";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useDebouncedValue } from "@mantine/hooks";

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

  const debouncedSearchText = useDebouncedValue(searchText, 300);

  return (
    <Dialog.Content {...rest}>
      <Dialog.Title>Add Sources</Dialog.Title>
      <Dialog.Description>Search for sources from Spotify</Dialog.Description>
      <Flex>
        <TextField.Root
          value={searchText}
          onChange={(e) => setSearchText(e.currentTarget.value)}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon width={16} height={16} />
          </TextField.Slot>
        </TextField.Root>
      </Flex>
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

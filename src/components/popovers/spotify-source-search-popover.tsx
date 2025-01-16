import { ItemType } from "@soundify/web-api";
import { SpotifySearchItem } from "../../types";
import {
  Flex,
  IconButton,
  Popover,
  ScrollArea,
  TextField,
  Text,
} from "@radix-ui/themes";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { SpotifyQueries } from "../../queries";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { colors } from "../../theme/colors";
import { SearchResult } from "../spotify";

type SpotifySourceSearchPopoverProps<T extends ItemType> = {
  type: T;
  onSourceSelect: (source: SpotifySearchItem<T>) => void;
} & Popover.ContentProps;

export const SpotifySourceSearchPopover = <T extends ItemType>({
  type,
  onSourceSelect,
  ...rest
}: SpotifySourceSearchPopoverProps<T>) => {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, cancelSearchTextDebounce] = useDebouncedValue(
    searchText,
    300,
  );

  const { data } = SpotifyQueries.useSearchQuery<
    T,
    unknown,
    SpotifySearchItem<T>[]
  >(
    {
      query: debouncedSearchText,
      type,
    },
    {
      enabled: !!debouncedSearchText,
      select: (data): SpotifySearchItem<T>[] => {
        console.log("brayden-test", { data });
        const key = type + "s";
        if (key in data)
          return data[key as keyof typeof data].items.filter((item) => !!item);
        return [];
      },
    },
  );

  return (
    <Popover.Content {...rest}>
      <Text color="gray">Search for {type + "s"}:</Text>
      <div
        css={{
          padding: "8px 0px",
          borderBottom: `1px solid ${colors.grayDark.gray7}`,
        }}
      >
        <TextField.Root
          value={searchText}
          onChange={(e) => setSearchText(e.currentTarget.value)}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
          {!!searchText && (
            <TextField.Slot>
              <IconButton
                variant="ghost"
                color="gray"
                onClick={() => {
                  setSearchText("");
                  cancelSearchTextDebounce();
                }}
              >
                <Cross2Icon />
              </IconButton>
            </TextField.Slot>
          )}
        </TextField.Root>
      </div>
      <ScrollArea scrollbars="vertical" css={{ maxHeight: "min(250px, 90vh)" }}>
        <Flex direction="column" gap="1" css={{ width: "min(350px, 90vw)" }}>
          {data?.map((searchItem) => {
            return (
              <SearchResult
                key={searchItem.id}
                type={type}
                item={searchItem}
                onClick={() => {
                  onSourceSelect(searchItem);
                }}
                imageSize={40}
              />
            );
          })}
        </Flex>
      </ScrollArea>
    </Popover.Content>
  );
};

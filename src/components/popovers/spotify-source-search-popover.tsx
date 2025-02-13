import { ItemType } from "@soundify/web-api";
import { SpotifySearchItem } from "../../types";
import {
  Flex,
  IconButton,
  Popover,
  ScrollArea,
  TextField,
  Text,
  Spinner,
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

  const { data, isLoading, isFetched } = SpotifyQueries.useSearchQuery<
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
        const key = type + "s";
        if (key in data)
          return data[key as keyof typeof data].items.filter((item) => !!item);
        return [];
      },
    },
  );

  const showResults = isLoading || isFetched;

  return (
    <Popover.Content
      css={{
        maxWidth: "var(--radix-popover-trigger-width)",
      }}
      {...rest}
    >
      <span
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text color="gray">Search for {type + "s"}:</Text>
        <Popover.Close>
          <IconButton variant="ghost" color="gray">
            <Cross2Icon />
          </IconButton>
        </Popover.Close>
      </span>
      <div
        css={{
          padding: "8px 0px",
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
      {showResults &&
        (isLoading ? (
          <span
            css={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 16,
            }}
          >
            <Spinner />
          </span>
        ) : (
          <ScrollArea
            scrollbars="vertical"
            css={{
              paddingTop: 8,
              maxHeight: "min(250px, 90vh)",
              borderTop: `1px solid ${colors.grayDark.gray7}`,
            }}
            type="auto"
          >
            <Flex direction="column" gap="1">
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
        ))}
    </Popover.Content>
  );
};

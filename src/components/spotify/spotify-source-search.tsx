import { ReactNode, useState } from "react";
import { SpotifyQueries } from "../../queries";
import { Database } from "../../types";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import {
  Button,
  Grid,
  IconButton,
  Popover,
  Text,
  TextField,
} from "@radix-ui/themes";
import { SpotifyComponents } from "..";
import { colors } from "../../theme/colors";
import { getIntervalString } from "../../utils";
import { RecentlyListenedConfigPopover } from "../popovers";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { SourceImage } from "./source-image";
import { SpotifySourceSearchPopover } from "../popovers/spotify-source-search-popover";

type SpotifySearchedSourceConfig = {
  spotifyId: string;
  imageUrl: string;
  title: string;
};

interface SpotifySourceTypeConfigMap
  extends Record<Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"], object> {
  LIKED_SONGS: Record<string, never>;
  RECENTLY_PLAYED: Pick<
    Database["public"]["Tables"]["recently_played_source_configs"]["Row"],
    "quantity" | "interval"
  >;
  PLAYLIST: SpotifySearchedSourceConfig;
  ALBUM: SpotifySearchedSourceConfig;
  TRACK: SpotifySearchedSourceConfig;
  ARTIST: SpotifySearchedSourceConfig;
}

type SpotifySourceSelectionFn = <
  T extends Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"],
>(
  source: SelectedSource<T>,
) => void | Promise<void>;

type SelectedSource<
  T extends
    Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"] = Database["public"]["Enums"]["SPOTIFY_SOURCE_TYPE"],
> = {
  sourceType: T;
  config: SpotifySourceTypeConfigMap[T];
};

type SpotifySourceSearchProps = {
  oneClickSelect?: boolean;
  onSelect: SpotifySourceSelectionFn;
  title?: ReactNode;
};

export const SpotifySourceSearch = ({
  oneClickSelect = false,
  onSelect,
  title,
}: SpotifySourceSearchProps) => {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, cancelSearchTextDebounce] = useDebouncedValue(
    searchText,
    300,
  );

  const [selectedSource, setSelectedSource] = useState<SelectedSource>();
  const [
    recentlyListenedConfigIsOpen,
    { open: openRecentlyListened, close: closeRecentlyListened },
  ] = useDisclosure(false);

  return (
    <div
      css={{
        padding: "8px 0px",
      }}
    >
      {typeof title === "string" ? <Text>{title}</Text> : title}
      <Grid
        columns="2"
        gap="2"
        css={{
          borderBottom: `1px solid ${colors.grayDark.gray7}`,
          padding: "8px 0px",
        }}
      >
        <SpotifyComponents.StaticSourceCard
          type="LIKED_SONGS"
          onClick={() =>
            setSelectedSource({ sourceType: "LIKED_SONGS", config: {} })
          }
          isSelected={selectedSource?.sourceType === "LIKED_SONGS"}
        />
        <Popover.Root
          open={recentlyListenedConfigIsOpen}
          onOpenChange={(newVal) =>
            newVal ? openRecentlyListened() : closeRecentlyListened()
          }
        >
          <Popover.Trigger>
            <SpotifyComponents.StaticSourceCard
              type="RECENTLY_PLAYED"
              isSelected={selectedSource?.sourceType === "RECENTLY_PLAYED"}
              subtitle={
                selectedSource?.sourceType === "RECENTLY_PLAYED"
                  ? `Last ${(selectedSource.config as SelectedSource<"RECENTLY_PLAYED">["config"]).quantity.toLocaleString()} ${getIntervalString((selectedSource.config as SelectedSource<"RECENTLY_PLAYED">["config"]).interval)}`
                  : undefined
              }
            />
          </Popover.Trigger>
          <RecentlyListenedConfigPopover
            onSave={(config) => {
              setSelectedSource({
                sourceType: "RECENTLY_PLAYED",
                config: {
                  quantity: config.quantity,
                  interval: config.interval,
                },
              });
              closeRecentlyListened();
            }}
          />
        </Popover.Root>
        <Popover.Root>
          <Popover.Trigger>
            {/* TODO: Make button height the same as above */}
            <Button
              variant="soft"
              color="gray"
              css={{
                justifyContent: "start",
                padding: 8,
              }}
            >
              <SourceImage sourceType="PLAYLIST" />
              <Text>Add Playlist</Text>
            </Button>
          </Popover.Trigger>
          <SpotifySourceSearchPopover
            type="playlist"
            onSourceSelect={() => {}}
          />
        </Popover.Root>
      </Grid>
      <div
        css={{
          padding: "8px 0px",
        }}
      >
        <Text size="2" color="gray">
          Search Spotify for other sources:
        </Text>
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
    </div>
  );
};

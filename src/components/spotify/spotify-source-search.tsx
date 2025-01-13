import { ReactNode, useState } from "react";
import { SpotifyQueries } from "../../queries";
import { Database } from "../../types";
import { useDebouncedValue } from "@mantine/hooks";
import { Grid, Text } from "@radix-ui/themes";
import { SpotifyComponents } from "..";
import { colors } from "../../theme/colors";
import { getIntervalString } from "../../utils";

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
  const searchQuery = SpotifyQueries.useSearchQuery({
    query: debouncedSearchText,
  });

  const [selectedSource, setSelectedSource] = useState<SelectedSource>();

  return (
    <div>
      {typeof title === "string" ? <Text>{title}</Text> : title}
      <Grid
        columns="2"
        css={{ borderBottom: `1px solid ${colors.grayDark.gray7}` }}
      >
        <SpotifyComponents.StaticSourceCard
          type="LIKED_SONGS"
          isSelected={selectedSource?.sourceType === "LIKED_SONGS"}
        />
        <SpotifyComponents.StaticSourceCard
          type="RECENTLY_PLAYED"
          isSelected={selectedSource?.sourceType === "RECENTLY_PLAYED"}
          subtitle={
            selectedSource?.sourceType === "RECENTLY_PLAYED"
              ? `Last ${(selectedSource.config as SelectedSource<"RECENTLY_PLAYED">["config"]).quantity.toLocaleString()} ${getIntervalString((selectedSource.config as SelectedSource<"RECENTLY_PLAYED">["config"]).interval)}`
              : undefined
          }
        />
      </Grid>
    </div>
  );
};

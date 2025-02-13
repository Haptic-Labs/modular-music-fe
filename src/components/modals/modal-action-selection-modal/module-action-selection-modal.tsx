import {
  Text,
  Button,
  Dialog,
  Grid,
  Card,
  Flex,
  IconButton,
} from "@radix-ui/themes";
import { Database } from "../../../types";
import { colors } from "../../../theme/colors";
import { ModuleActionCard } from "../../actions";
import { useState } from "react";
import {
  SelectedSource,
  SpotifySourceSearch,
} from "../../spotify/spotify-source-search";
import { SourceImage } from "../../spotify";
import { Cross2Icon } from "@radix-ui/react-icons";

interface ActionTypeUpsertRequestMap
  extends Record<Database["public"]["Enums"]["MODULE_ACTION_TYPE"], object> {
  SHUFFLE: Database["public"]["Functions"]["UpsertModuleActionShuffle"]["Args"];
  LIMIT: Database["public"]["Functions"]["UpsertModuleActionLimit"]["Args"];
  FILTER: Database["public"]["Functions"]["UpsertModuleActionFilter"]["Args"];
  COMBINE: Database["public"]["Functions"]["UpsertModuleActionCombine"]["Args"];
}

type SelectedAction<
  T extends Database["public"]["Enums"]["MODULE_ACTION_TYPE"],
> = { actionType: T; action: ActionTypeUpsertRequestMap[T] };

type ModuleActionSelectionModalProps = {
  onSubmit: <T extends Database["public"]["Enums"]["MODULE_ACTION_TYPE"]>(
    action: SelectedAction<T>,
  ) => void | Promise<void>;
} & Omit<Dialog.ContentProps, "onSubmit">;

export const ModuleActionSelectionModal = ({
  onSubmit,
  ...rest
}: ModuleActionSelectionModalProps) => {
  const [selectedActionType, setSelectedActionType] =
    useState<Database["public"]["Enums"]["MODULE_ACTION_TYPE"]>();
  const [selectedSources, setSelectedSources] = useState<
    Database["public"]["CompositeTypes"]["SpotifySource"][]
  >([]);
  const [recentlyListenedConfig, setRecentlyListenedConfig] =
    useState<
      Pick<
        Database["public"]["Tables"]["recently_played_source_configs"]["Row"],
        "quantity" | "interval"
      >
    >();

  return (
    <Dialog.Content
      css={{
        maxHeight: "75vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      maxWidth="min(700px, 95vw)"
      onBlur={() => setSelectedActionType(undefined)}
      {...rest}
    >
      <div css={{ width: "100%", minHeight: "max-content" }}>
        <Dialog.Title>Select Action</Dialog.Title>
        <Dialog.Description mb="2" color="gray">
          Select an action to add to your module
        </Dialog.Description>
        <Grid
          columns="2"
          gap="2"
          pb="2"
          css={{ borderBottom: `1px solid ${colors.grayDark.gray7}` }}
        >
          <ModuleActionCard
            actionType="FILTER"
            onClick={() => {
              setSelectedSources([]);
              setSelectedActionType("FILTER");
            }}
            isSelected={selectedActionType === "FILTER"}
          />
          <ModuleActionCard
            actionType="LIMIT"
            onClick={() => setSelectedActionType("LIMIT")}
            isSelected={selectedActionType === "LIMIT"}
          />
          <ModuleActionCard
            actionType="SHUFFLE"
            onClick={() => setSelectedActionType("SHUFFLE")}
            isSelected={selectedActionType === "SHUFFLE"}
          />
          <ModuleActionCard
            actionType="COMBINE"
            onClick={() => {
              setSelectedSources([]);
              setSelectedActionType("COMBINE");
            }}
            isSelected={selectedActionType === "COMBINE"}
          />
        </Grid>
        <Grid>
          {selectedSources.map((source) => {
            if (source.source_type === null) return null;

            return (
              <Card
                css={{
                  justifyContent: "space-between",
                  padding: 8,
                  height: "max-content",
                  display: "flex",
                  alignItems: "center",
                }}
                variant="surface"
              >
                <Flex gap="1">
                  <SourceImage sourceType={source.source_type} />
                  <Text as="p">{source.title}</Text>
                </Flex>
                <IconButton
                  variant="ghost"
                  color="gray"
                  onClick={() => {
                    setSelectedSources((prev) =>
                      prev.filter((s) => s.spotify_id !== source.spotify_id),
                    );
                  }}
                >
                  <Cross2Icon />
                </IconButton>
              </Card>
            );
          })}
        </Grid>
        <SpotifySourceSearch
          title="Select Sources"
          // TODO: manage selected sources internally
          onSelect={(newSource) => {
            if (
              newSource.sourceType === "PLAYLIST" ||
              newSource.sourceType === "ARTIST" ||
              newSource.sourceType === "TRACK" ||
              newSource.sourceType === "ALBUM"
            ) {
              const typedSource = newSource as SelectedSource<
                "PLAYLIST" | "ARTIST" | "TRACK" | "ALBUM"
              >;
              const newSelectedSource: (typeof selectedSources)[number] = {
                spotify_id: typedSource.config.spotifyId,
                source_type: typedSource.sourceType,
                image_url: typedSource.config.imageUrl,
                title: typedSource.config.title,
                limit: null,
              };
              setSelectedSources((prev) => {
                const existingSource = prev.find(
                  (source) =>
                    source.spotify_id === typedSource.config.spotifyId,
                );
                if (existingSource) {
                  return prev.map((source) =>
                    source.spotify_id === typedSource.config.spotifyId
                      ? newSelectedSource
                      : source,
                  );
                }

                return [...prev, newSelectedSource];
              });
            } else if (newSource.sourceType === "LIKED_SONGS") {
              setSelectedSources((prev) => {
                const alreadyHasLikedSongs = prev.some(
                  (source) => source.source_type === "LIKED_SONGS",
                );
                if (alreadyHasLikedSongs) return prev;
                return [
                  ...prev,
                  {
                    source_type: "LIKED_SONGS",
                    spotify_id: "LIKED_SONGS",
                    image_url: null,
                    title: "My Liked Songs",
                    limit: null,
                  },
                ];
              });
            } else if (newSource.sourceType === "RECENTLY_PLAYED") {
              const typedSource =
                newSource as SelectedSource<"RECENTLY_PLAYED">;
              setSelectedSources((prev) => {
                const shouldAddSource = !recentlyListenedConfig;
                setRecentlyListenedConfig(typedSource.config);
                if (shouldAddSource) {
                  return [
                    ...prev,
                    {
                      source_type: "RECENTLY_PLAYED",
                      spotify_id: "RECENTLY_PLAYED",
                      image_url: null,
                      title: "Recently Played",
                      limit: null,
                    },
                  ];
                }
                return prev;
              });
            }
          }}
        />
      </div>
    </Dialog.Content>
  );
};

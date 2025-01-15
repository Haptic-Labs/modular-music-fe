import { Dialog, Grid } from "@radix-ui/themes";
import { Database } from "../../../types";
import { colors } from "../../../theme/colors";
import { ModuleActionCard } from "../../actions";
import { useState } from "react";
import { SpotifySourceSearch } from "../../spotify/spotify-source-search";

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

  return (
    <Dialog.Content
      css={{
        maxHeight: "75vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
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
            onClick={() => setSelectedActionType("FILTER")}
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
            onClick={() => setSelectedActionType("COMBINE")}
            isSelected={selectedActionType === "COMBINE"}
          />
        </Grid>
        <SpotifySourceSearch title="Select Sources" />
      </div>
    </Dialog.Content>
  );
};

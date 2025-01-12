import { ReactNode } from "react";
import { Database } from "../../types";
import { Button, ButtonProps, Flex, Text } from "@radix-ui/themes";
import { ModuleActionIcon } from "./module-action-icon";
import { colors } from "../../theme/colors";

const getActionTitleFromType = (
  actionType: Database["public"]["Enums"]["MODULE_ACTION_TYPE"],
) => {
  switch (actionType) {
    case "SHUFFLE":
      return "Shuffle";
    case "COMBINE":
      return "Add Sources";
    case "LIMIT":
      return "Limit";
    case "FILTER":
      return "Filter";
    default:
      return undefined;
  }
};

type GetActionSubtitleArgs<
  T extends Database["public"]["Enums"]["MODULE_ACTION_TYPE"],
> = {
  actionType: T;
  config: ModuleActionMap[T]["config"];
};

const getActionSubtitle = <
  T extends Database["public"]["Enums"]["MODULE_ACTION_TYPE"],
>({
  actionType,
  config,
}: GetActionSubtitleArgs<T>): string | undefined => {
  if (actionType === "SHUFFLE") {
    const typedConfig = config as GetActionSubtitleArgs<"SHUFFLE">["config"];
    switch (typedConfig.shuffle_type) {
      case "RANDOM":
        return "Random";
      default:
        return undefined;
    }
  } else if (actionType === "FILTER" || actionType === "COMBINE") {
    const typedConfig = config as GetActionSubtitleArgs<
      "FILTER" | "COMBINE"
    >["config"];
    const count = typedConfig.sources.length;
    return `${count.toLocaleString()} sources`;
  } else if (actionType === "LIMIT") {
    const typedConfig = config as GetActionSubtitleArgs<"LIMIT">["config"];
    return `Limit to ${typedConfig.limit?.toLocaleString() ?? 0} items`;
  } else {
    return undefined;
  }
};

interface ModuleActionMap
  extends Record<
    Database["public"]["Enums"]["MODULE_ACTION_TYPE"],
    { createRequest: object; config: object }
  > {
  SHUFFLE: {
    createRequest: Database["public"]["CompositeTypes"]["ModuleAction:Shuffle"];
    config: Database["public"]["CompositeTypes"]["ModuleAction:Shuffle:Config"];
  };
  LIMIT: {
    createRequest: Database["public"]["CompositeTypes"]["ModuleAction:Limit"];
    config: Database["public"]["CompositeTypes"]["ModuleAction:Limit:Config"];
  };
  FILTER: {
    createRequest: Database["public"]["CompositeTypes"]["ModuleAction:Filter"];
    config: {
      sources: Database["public"]["Tables"]["filter_action_sources"]["Row"][];
    };
  };
  COMBINE: {
    createRequest: Database["public"]["CompositeTypes"]["ModuleAction:Combine"];
    config: {
      sources: Database["public"]["Tables"]["combine_action_sources"]["Row"][];
    };
  };
}

type ModuleActionCardProps<
  T extends Database["public"]["Enums"]["MODULE_ACTION_TYPE"],
> = {
  actionType: T;
  action?: ModuleActionMap[T];
  title?: ReactNode;
  subtitle?: ReactNode;
  isSelected?: boolean;
} & ButtonProps;

export const ModuleActionCard = <
  T extends Database["public"]["Enums"]["MODULE_ACTION_TYPE"],
>({
  actionType,
  action,
  title: providedTitle,
  subtitle: providedSubtitle,
  isSelected,
  ...rest
}: ModuleActionCardProps<T>) => {
  const title =
    providedTitle ?? getActionTitleFromType(actionType) ?? "Unknown Action";
  const subtitle =
    providedSubtitle ??
    (action
      ? getActionSubtitle<T>({
          actionType,
          config:
            "sources" in action
              ? { sources: action.sources }
              : { config: action.config },
        })
      : undefined);
  // TODO: add accordion for sources

  return (
    <Button
      title={title}
      color={isSelected ? "green" : "gray"}
      variant={isSelected ? "solid" : "soft"}
      size="3"
      css={{
        justifyContent: "start",
        height: "max-content",
        padding: 8,
        paddingRight: 24,
      }}
      {...rest}
    >
      <ModuleActionIcon
        type={actionType}
        color={isSelected ? "white" : colors.greenDark.green9}
      />
      <Flex direction="column" gap="1">
        <Text as="p" truncate>
          {title}
        </Text>
        {!!subtitle && (
          <Text as="p" truncate>
            {subtitle}
          </Text>
        )}
      </Flex>
    </Button>
  );
};

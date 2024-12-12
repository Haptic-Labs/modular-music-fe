import { Button, ButtonProps, Text } from "@radix-ui/themes";
import { HTMLAttributes } from "react";
import { SourceImage } from "./source-image";

type StaticSourceCardProps = {
  type: "LIKED_SONGS" | "RECENTLY_PLAYED";
  imageSize?: number;
  isSelected: boolean;
} & Pick<ButtonProps, "color" | "variant" | "onClick"> &
  HTMLAttributes<HTMLButtonElement>;

export const StaticSourceCard = ({
  type,
  imageSize = 30,
  isSelected,
  ...rest
}: StaticSourceCardProps) => {
  const title =
    type === "LIKED_SONGS" ? "My Liked Songs" : "My Recently Played Songs";

  return (
    <Button
      title={title}
      css={{
        justifyContent: "start",
        height: "max-content",
        padding: 8,
        paddingRight: 24,
      }}
      variant={isSelected ? "solid" : "soft"}
      color={isSelected ? "green" : "gray"}
      {...rest}
    >
      <SourceImage
        sourceType={type}
        css={{
          width: imageSize,
          minWidth: imageSize,
          height: imageSize,
          minHeight: imageSize,
          borderRadius: 8,
          padding: 8,
        }}
      />
      <Text
        as="p"
        truncate
        css={{
          maxWidth: "100%",
        }}
      >
        {title}
      </Text>
    </Button>
  );
};

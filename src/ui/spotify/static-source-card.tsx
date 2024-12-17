import { Button, ButtonProps, Text } from "@radix-ui/themes";
import { forwardRef, HTMLAttributes } from "react";
import { SourceImage } from "./source-image";

type StaticSourceCardProps = {
  type: "LIKED_SONGS" | "RECENTLY_PLAYED";
  imageSize?: number;
  isSelected?: boolean;
} & Pick<ButtonProps, "color" | "variant" | "onClick"> &
  HTMLAttributes<HTMLButtonElement>;

export const StaticSourceCard = forwardRef<
  HTMLButtonElement,
  StaticSourceCardProps
>(({ type, imageSize = 30, isSelected = false, ...rest }, ref) => {
  const title =
    type === "LIKED_SONGS" ? "My Liked Songs" : "My Recently Played Songs";

  return (
    <Button
      ref={ref}
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
        color={isSelected ? "white" : undefined}
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
});

import { PopoverContentOwnProps } from "@radix-ui/themes/props";
import { RecentlyListenedConfig } from "../../types";
import {
  Button,
  DropdownMenu,
  Flex,
  Popover,
  TextField,
} from "@radix-ui/themes";
import { useState } from "react";

type RecentlyListenedConfigPopoverProps = {
  initialConfig?: Partial<RecentlyListenedConfig>;
  onSave: (config: RecentlyListenedConfig) => void;
} & PopoverContentOwnProps;

export const RecentlyListenedConfigPopover = ({
  initialConfig,
  onSave,
  ...rest
}: RecentlyListenedConfigPopoverProps) => {
  const [quantity, setQuantity] = useState(initialConfig?.quantity);
  const [interval, setInterval] = useState(initialConfig?.interval ?? "DAYS");

  return (
    <Popover.Content {...rest}>
      <Flex direction="column">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <TextField.Root
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Number(e.currentTarget.value || "0"))
              }
              placeholder="Quantity"
            />
          </DropdownMenu.Trigger>
        </DropdownMenu.Root>
      </Flex>
    </Popover.Content>
  );
};

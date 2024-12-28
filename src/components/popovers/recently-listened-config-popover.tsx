import { PopoverContentOwnProps } from "@radix-ui/themes/props";
import { Database, RecentlyListenedConfig } from "../../types";
import {
  Text,
  Flex,
  Popover,
  TextField,
  Button,
  Select,
} from "@radix-ui/themes";
import { Form, useForm } from "@mantine/form";
import { useEffect } from "react";

type RecentlyListenedConfigPopoverProps = {
  initialConfig?: Partial<RecentlyListenedConfig>;
  onSave: (config: RecentlyListenedConfig) => void;
} & PopoverContentOwnProps;

export const RecentlyListenedConfigPopover = ({
  initialConfig,
  onSave,
  ...rest
}: RecentlyListenedConfigPopoverProps) => {
  const minMaxQuantityMap: Record<
    Database["public"]["Enums"]["RECENTLY_PLAYED_INTERVAL"],
    { min: number; max: number }
  > = {
    DAYS: {
      min: 1,
      max: 90,
    },
    WEEKS: {
      min: 1,
      max: 12,
    },
    MONTHS: {
      min: 1,
      max: 3,
    },
  };

  const form = useForm({
    initialValues: {
      quantity: initialConfig?.quantity,
      interval: initialConfig?.interval ?? "DAYS",
    },
    validate: {
      quantity: (number, { interval }) =>
        number === undefined
          ? null
          : number > minMaxQuantityMap[interval].max
            ? `Maximum recently listened time is ${minMaxQuantityMap[interval].max} ${interval.toLowerCase()}`
            : number < minMaxQuantityMap[interval].min
              ? `Must be at least 1 ${interval.toLowerCase().slice(0, -1)}`
              : null,
    },
    validateInputOnChange: true,
  });

  const valuesHaveChanges = initialConfig ? form.isDirty() : true;

  useEffect(() => {
    form.resetDirty();
  }, [JSON.stringify(initialConfig)]);

  return (
    <Popover.Content {...rest}>
      <Form
        form={form}
        onSubmit={() => {
          if (form.values.quantity) {
            onSave({
              quantity: form.values.quantity,
              interval: form.values.interval,
            });
          }
        }}
      >
        <Flex direction="column">
          <Text color="gray" size="2" mb="1">
            Quantity
          </Text>
          <TextField.Root
            {...form.getInputProps("quantity")}
            placeholder={`Enter amount of ${form.values.interval.toLowerCase()}...`}
            color={
              form.errors.quantity && form.getTouched().quantity
                ? "red"
                : undefined
            }
          />
          <Text color="red" size="1" mt="1">
            {form.errors.quantity}
          </Text>
          <Text color="gray" size="2" mt="2" mb="1">
            Interval
          </Text>
          <Select.Root
            {...form.getInputProps("interval")}
            onValueChange={(value) =>
              form.setFieldValue(
                "interval",
                value as Database["public"]["Enums"]["RECENTLY_PLAYED_INTERVAL"],
              )
            }
          >
            <Select.Trigger
              color={
                form.errors.interval && form.getTouched().interval
                  ? "red"
                  : undefined
              }
            />
            <Select.Content position="popper">
              <Select.Item value="DAYS">Days</Select.Item>
              <Select.Item value="WEEKS">Weeks</Select.Item>
              <Select.Item value="MONTHS">Months</Select.Item>
            </Select.Content>
          </Select.Root>
          <Button
            disabled={
              !form.isValid() || !form.values.quantity || !valuesHaveChanges
            }
            mt="3"
            size="2"
            type="submit"
          >
            Save
          </Button>
        </Flex>
      </Form>
    </Popover.Content>
  );
};

import { Button, Dialog, TextField, Text, Flex } from '@radix-ui/themes';
import { useEffect, useState } from 'react';

type LimitConfigModalProps = {
  title?: string;
  initMaxItems?: number;
  onSave: (maxItems: number) => void;
  isOpen: boolean;
} & Dialog.ContentProps;

export const LimitConfigModal = ({
  title,
  initMaxItems,
  onSave,
  isOpen,
  ...rest
}: LimitConfigModalProps) => {
  const [maxItems, setMaxItems] = useState<number | undefined>(initMaxItems);
  const enableSubmit =
    maxItems !== undefined && maxItems > 0 && maxItems !== initMaxItems;

  useEffect(() => {
    if (!isOpen) {
      setMaxItems(initMaxItems);
    }
  }, [isOpen]);

  return (
    <Dialog.Content maxWidth='min(400px, 90vw)' {...rest}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (enableSubmit) {
            onSave(maxItems ?? 0);
          }
        }}
      >
        <Dialog.Title>{title ?? 'Add Limit Action'}</Dialog.Title>
        <Text size='2' weight='bold'>
          Item Limit:
        </Text>
        <TextField.Root
          placeholder='Enter the maximum items...'
          type='number'
          value={maxItems}
          onChange={(e) => setMaxItems(Number(e.target.value))}
          mt='1'
          mb='3'
        />
        <Flex justify='end' width='100%' gap='2'>
          <Dialog.Close>
            <Button
              variant='outline'
              color='gray'
              onClick={() => onSave(maxItems ?? 0)}
            >
              Cancel
            </Button>
          </Dialog.Close>
          <Button disabled={!enableSubmit} type='submit'>
            Save
          </Button>
        </Flex>
      </form>
    </Dialog.Content>
  );
};

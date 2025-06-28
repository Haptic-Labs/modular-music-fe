import {
  Modal,
  ModalProps,
  Title,
  Text,
  NumberInput,
  Group,
  Button,
} from '@mantine/core';
import { useEffect, useState } from 'react';

type LimitConfigModalProps = {
  title?: string;
  initMaxItems?: number;
  onSave: (maxItems: number) => void;
  isOpen: boolean;
} & ModalProps;

export const LimitConfigModal = ({
  title,
  initMaxItems,
  onSave,
  isOpen,
  ...modalProps
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
    <Modal maw='min(400px, 90vw)' {...modalProps}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (enableSubmit) {
            onSave(maxItems ?? 0);
          }
        }}
      >
        <Title>{title ?? 'Add Limit Action'}</Title>
        <Text css={{ fontWeight: 'bold' }}>Item Limit:</Text>
        <NumberInput
          placeholder='Enter the maximum items...'
          value={maxItems}
          onChange={(value) => setMaxItems(Number(value))}
          mt='1'
          mb='3'
        />
        <Group justify='end' w='100%' gap='md'>
          <Button variant='outline' color='gray' onClick={modalProps.onClose}>
            Cancel
          </Button>
          <Button disabled={!enableSubmit} type='submit'>
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

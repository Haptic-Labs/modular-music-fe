import { ComponentProps } from 'react';
import { ActionCard } from './action-card';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SortableActionCardProps = ComponentProps<typeof ActionCard>;

export const SortableActionCard = (props: SortableActionCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ActionCard
      {...props}
      ref={setNodeRef}
      style={{ ...props.style, ...style }}
      css={{
        '.handle': {
          cursor: 'grab',
          padding: 5,
          lineHeight: 0,
        },
      }}
      handle
      handleProps={{ ...attributes, ...listeners, className: 'handle' }}
    />
  );
};

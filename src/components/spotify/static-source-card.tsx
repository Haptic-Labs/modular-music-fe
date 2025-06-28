import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { SourceImage } from './source-image';
import { Button, ButtonProps, Stack, Text } from '@mantine/core';

type StaticSourceCardProps = {
  type: 'LIKED_SONGS' | 'RECENTLY_PLAYED';
  imageSize?: number;
  isSelected?: boolean;
  subtitle?: ReactNode;
} & Pick<ButtonProps, 'color' | 'variant'> &
  HTMLAttributes<HTMLButtonElement>;

export const StaticSourceCard = forwardRef<
  HTMLButtonElement,
  StaticSourceCardProps
>(({ type, imageSize = 24, isSelected = false, subtitle, ...rest }, ref) => {
  const title =
    type === 'LIKED_SONGS' ? 'My Liked Songs' : 'My Recently Played Songs';

  return (
    <Button
      ref={ref}
      title={title}
      css={{
        justifyContent: 'start',
        height: 'max-content',
        padding: 8,
        paddingRight: 24,
      }}
      variant={isSelected ? 'solid' : 'soft'}
      color={isSelected ? 'green' : 'gray'}
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
        }}
        color={isSelected ? 'white' : undefined}
      />
      <Stack align='start'>
        <Text
          truncate
          css={{
            maxWidth: '100%',
          }}
        >
          {title}
        </Text>
        {typeof subtitle === 'string' ? (
          <Text c='gray'>{subtitle}</Text>
        ) : (
          subtitle
        )}
      </Stack>
    </Button>
  );
});

import { HTMLAttributes } from 'react';
import { useMantineTheme } from '@mantine/core';

type LikedSongsIconProps = {
  color?: string;
} & HTMLAttributes<SVGElement>;

export const LikedSongsIcon = ({
  color: providedColor,
  ...rest
}: LikedSongsIconProps) => {
  const theme = useMantineTheme();
  const color = providedColor ?? theme.colors.green[7];
  return (
    <svg
      height='50'
      width='50'
      viewBox='0 0 16 16'
      {...rest}
      css={{ fill: color }}
    >
      <path d='M15.724 4.22A4.313 4.313 0 0012.192.814a4.269 4.269 0 00-3.622 1.13.837.837 0 01-1.14 0 4.272 4.272 0 00-6.21 5.855l5.916 7.05a1.128 1.128 0 001.727 0l5.916-7.05a4.228 4.228 0 00.945-3.577z'></path>
    </svg>
  );
};

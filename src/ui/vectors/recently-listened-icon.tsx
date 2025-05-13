import { useMantineTheme } from '@mantine/core';
import { HTMLAttributes } from 'react';

type RecentlyListenedIconProps = {
  color?: string;
} & HTMLAttributes<SVGElement>;

export const RecentlyListenedIcon = ({
  color: providedColor,
  ...rest
}: RecentlyListenedIconProps) => {
  const theme = useMantineTheme();
  const color = providedColor ?? theme.colors.green[9];
  return (
    <svg
      width='50'
      height='50'
      viewBox='0 0 100 100'
      xmlns='http://www.w3.org/2000/svg'
      css={{
        fill: color,
        stroke: color,
      }}
      {...rest}
    >
      <path d='M0.5 50C0.5 22.6755 22.6268 0.5 49.95 0.5C77.3242 0.5 99.5 22.6765 99.5 50C99.5 77.3235 77.3242 99.5 49.95 99.5C22.6268 99.5 0.5 77.3245 0.5 50ZM9.5 50C9.5 72.3761 27.6239 90.5 50 90.5C72.3761 90.5 90.5 72.3761 90.5 50C90.5 27.6239 72.3761 9.5 50 9.5C27.6239 9.5 9.5 27.6239 9.5 50Z' />
      <path
        d='M69.2399 69.5297L69.2408 69.5303C71.0822 70.6928 73.4676 70.1107 74.5504 68.1364C74.8212 67.6674 75.0011 67.1452 75.0798 66.6008C75.1585 66.056 75.1343 65.4997 75.0085 64.965C74.8827 64.4303 74.6578 63.9277 74.3468 63.4874C74.0361 63.0474 73.6456 62.6783 73.1983 62.4026C73.198 62.4024 73.1977 62.4022 73.1974 62.4021L52.9831 49.5075V24.0484C52.9831 21.7387 51.2589 19.875 49.0862 19.875H48.7719C46.5992 19.875 44.875 21.7387 44.875 24.0484V50.5881C44.875 52.5943 45.8362 54.492 47.5001 55.5293C47.5003 55.5295 47.5006 55.5297 47.5008 55.5298L69.2399 69.5297Z'
        stroke-width='0.25'
      />
    </svg>
  );
};

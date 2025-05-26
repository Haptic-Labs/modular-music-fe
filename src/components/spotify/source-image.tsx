import { HTMLAttributes } from 'react';
import { Database } from '../../types';
import { RecentlyListenedIcon } from '../../ui/vectors';
import {
  IconHeartFilled,
  IconMusic,
  IconPlaylist,
  IconProps,
  IconUser,
  IconVinyl,
} from '@tabler/icons-react';
import { useMantineTheme } from '@mantine/core';

type SVGType = 'LIKED_SONGS' | 'RECENTLY_PLAYED';

type SourceImageProps<
  T extends Database['public']['Enums']['SPOTIFY_SOURCE_TYPE'] | undefined,
  Src extends string | undefined,
> = {
  src?: Src;
  sourceType?: T;
  color?: string;
} & (T extends string
  ? HTMLAttributes<T extends SVGType ? SVGElement : HTMLImageElement>
  : IconProps);

export const SourceImage = <
  T extends Database['public']['Enums']['SPOTIFY_SOURCE_TYPE'] | undefined,
  Src extends string | undefined,
>({
  src,
  sourceType,
  color: providedColor,
  ...rest
}: SourceImageProps<T, Src>) => {
  const theme = useMantineTheme();
  const color = providedColor ?? theme.colors.green[9];
  if (sourceType === 'LIKED_SONGS') {
    const typedRest = rest as HTMLAttributes<SVGElement>;
    return <IconHeartFilled color={color} {...typedRest} />;
  } else if (sourceType === 'RECENTLY_PLAYED') {
    const typedRest = rest as HTMLAttributes<SVGElement>;
    return <RecentlyListenedIcon color={color} {...typedRest} />;
  } else if (src) {
    const typedRest = rest as HTMLAttributes<HTMLImageElement>;
    return <img src={src} {...typedRest} />;
  } else {
    const typedRest = rest as IconProps;
    switch (sourceType) {
      case 'TRACK':
        return <IconMusic color={color} {...typedRest} />;
      case 'ALBUM':
        return <IconVinyl color={color} {...typedRest} />;
      case 'ARTIST':
        return <IconUser color={color} {...typedRest} />;
      case 'PLAYLIST':
        return <IconPlaylist color={color} {...typedRest} />;
    }
  }
};

import { SpotifyImage } from "../types";

type GetSmallestSpotifyImageArgs = {
  images: SpotifyImage[];
  minimumSize?: number;
};

export const getSmallestSpotifyImage = ({
  images,
  minimumSize = 0,
}: GetSmallestSpotifyImageArgs): SpotifyImage | undefined => {
  const filteredAndSortedImages = images
    .filter((image) => {
      const width = image.width ?? 0;
      const height = image.height ?? 0;
      return width > minimumSize && height > minimumSize;
    }, [])
    .sort((a, b) =>
      (a.height ?? 0) > (b.height ?? 0) ? 1 : a.height === b.height ? 0 : -1,
    );
  return filteredAndSortedImages[0];
};

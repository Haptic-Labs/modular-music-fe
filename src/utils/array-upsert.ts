export const arrayUpsert = <T>(
  arr: T[],
  upsert: T extends symbol ? (oldItem: T) => T : T | ((oldItem: T) => T),
  predicate: (item: T) => boolean,
): T[] => {
  return arr.reduce<T[]>((acc, curr) => {
    if (predicate(curr)) {
      acc.push(typeof upsert === "function" ? upsert(curr) : upsert);
    } else {
      acc.push(curr);
    }

    return acc;
  }, []);
};

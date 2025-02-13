export const arrayUpsert = <T>(
  arr: T[],
  upsert: T extends symbol ? (oldItem: T) => T : T | ((oldItem: T) => T),
  predicate: (item: T) => boolean,
): T[] => {
  let hasUpdated = false;
  const updatedArr = arr.map((item) => {
    if (predicate(item)) {
      hasUpdated = true;
      return typeof upsert === "function" ? upsert(item) : upsert;
    } else {
      return item;
    }
  });

  if (hasUpdated) return updatedArr;
  return [...updatedArr, typeof upsert === "function" ? upsert() : upsert];
};

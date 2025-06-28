import { Partial } from "ts-toolbelt/out/Object/Partial";

type NonNullishObject<T extends object> = Partial<
  { [K in keyof T]: Exclude<T[K], null | undefined> },
  "deep"
>;

export const removeNullishFromObject = <T extends object>(
  obj: T,
): NonNullishObject<T> => {
  const entries = Object.entries(obj);

  const filteredEntries = entries.reduce<[string, unknown][]>(
    (acc, [key, value]) => {
      if (typeof value === "object" && value !== null) {
        acc.push([key, removeNullishFromObject(value)]);
      } else if (value !== undefined && value !== null) {
        acc.push([key, value]);
      }
      return acc;
    },
    [],
  );

  return Object.fromEntries(filteredEntries) as NonNullishObject<T>;
};

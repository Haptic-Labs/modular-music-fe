import { Database } from "./database.gen";

export type RecentlyListenedConfig = Pick<
  Database["public"]["Tables"]["recently_played_source_configs"]["Row"],
  "interval" | "quantity"
>;

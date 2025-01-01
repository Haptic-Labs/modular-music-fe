import { Database } from "../types";

type GetModuleActionSubtitleArgs = {
  type: Database["public"]["Enums"]["MODULE_ACTION_TYPE"];
  config: Database["public"]["Tables"]["module_actions"]["Row"]["config"];
};

export const getModuleActionSubtitle = ({
  type,
  config,
}: GetModuleActionSubtitleArgs): string | undefined => {
  if (type === "FILTER") {
    const first3Sources = config as Database["public"];
  }
};

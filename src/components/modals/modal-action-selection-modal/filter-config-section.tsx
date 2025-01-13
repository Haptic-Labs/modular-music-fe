import { Form, useForm } from "@mantine/form";
import { Database } from "../../../types";
import { useState } from "react";
import { ModulesQueries } from "../../../queries";

type FilterConfigFormProps = {
  moduleId: string;
  actionId?: string;
};

export const FilterConfigForm = ({
  moduleId,
  actionId,
}: FilterConfigFormProps) => {
  const isEditing = !!actionId;
  const existingSourcesQuery = ModulesQueries.useFilterActionSourcesQuery(
    { actionId: actionId ?? "" },
    { enabled: isEditing },
  );
  const [sources, setSources] = useState<
    Database["public"]["Tables"]["filter_action_sources"]["Row"][]
  >([]);

  const addSource = () => {};

  return <div></div>;
};

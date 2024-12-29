import { Code, Grid } from "@radix-ui/themes";
import { MODULE_GRID_CONFIG } from "../../constants";
import { ModulesQueries } from "../../queries";

type ModuleActionsGridProps = {
  moduleId: string;
};

export const ModuleActionsGrid = ({ moduleId }: ModuleActionsGridProps) => {
  const { data: actions } = ModulesQueries.useModuleActionsQuery({ moduleId });

  return (
    <Grid columns={MODULE_GRID_CONFIG} gap="2">
      {actions?.map((action) => <Code>{JSON.stringify(action)}</Code>)}
    </Grid>
  );
};

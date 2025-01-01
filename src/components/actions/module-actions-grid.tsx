import { Code, Grid } from "@radix-ui/themes";
import { MODULE_GRID_CONFIG } from "../../constants";
import { ModulesQueries } from "../../queries";
import { ModuleActionCard } from "./module-action-card";

type ModuleActionsGridProps = {
  moduleId: string;
};

export const ModuleActionsGrid = ({ moduleId }: ModuleActionsGridProps) => {
  const { data: actions } = ModulesQueries.useModuleActionsQuery({ moduleId });

  return (
    <Grid columns={MODULE_GRID_CONFIG} gap="2">
      {/* {actions?.map((action) => <Code>{JSON.stringify(action)}</Code>)} */}
      {actions?.map((action) => (
        <ModuleActionCard key={action.id} action={action} />
      ))}
    </Grid>
  );
};

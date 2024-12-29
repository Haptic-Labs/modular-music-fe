import { Grid } from "@radix-ui/themes";
import { ModulesQueries } from "../../queries";
import { ModuleSourceCard } from "./module-source-card";
import { AddSourceButton } from "./add-source-button";

type ModuleSourcesGridProps = {
  moduleId: string;
};

export const ModuleSourcesGrid = ({ moduleId }: ModuleSourcesGridProps) => {
  const { data: sources = [] } = ModulesQueries.useModuleSourcesQuery({
    moduleId,
  });

  return (
    <Grid
      columns={{
        initial: "2",
        sm: "2",
        xs: "1",
        lg: "3",
        xl: "4",
      }}
      gap="2"
    >
      {sources.map((source) => (
        <ModuleSourceCard source={source} />
      ))}
      <AddSourceButton moduleId={moduleId} />
    </Grid>
  );
};

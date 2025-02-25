import { Grid } from '@radix-ui/themes';
import { MODULE_GRID_CONFIG } from '../../constants';
import { ModulesQueries } from '../../queries';
import { AddActionButton } from './add-action-button';
import { SimpleActionCard } from './module-actions/simple-action-card';

type ModuleActionsGridProps = {
  moduleId: string;
};

export const ModuleActionsGrid = ({ moduleId }: ModuleActionsGridProps) => {
  const { data: actions } = ModulesQueries.useModuleActionsQuery({ moduleId });

  return (
    <Grid columns={MODULE_GRID_CONFIG} gap='2'>
      {actions?.map((action) => {
        switch (action.type) {
          case 'SHUFFLE':
          case 'LIMIT':
            return (
              <SimpleActionCard
                actionType={action.type}
                subtitle={action.type === 'SHUFFLE' ? 'Random' : undefined}
                onRemove={() => {}}
              />
            );
          default:
            return null;
        }
      })}
      <AddActionButton
        moduleId={moduleId}
        currentActionCount={actions?.length ?? 0}
      />
    </Grid>
  );
};

import { Grid } from '@radix-ui/themes';
import { MODULE_GRID_CONFIG } from '../../constants';
import { ModulesQueries } from '../../queries';
import { ModuleActionCard } from './module-action-card';
import { AddActionButton } from './add-action-button';
import { ShuffleActionCard } from './action-cards';

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
            return (
              <ShuffleActionCard action={{ ...action, type: 'SHUFFLE' }} />
            );
        }
        return (
          <ModuleActionCard
            key={action.id}
            action={action}
            actionType={action.type}
          />
        );
      })}
      <AddActionButton
        moduleId={moduleId}
        currentActionCount={actions?.length ?? 0}
      />
    </Grid>
  );
};

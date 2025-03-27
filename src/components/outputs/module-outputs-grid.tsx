import { Heading } from '@radix-ui/themes';
import { ModulesQueries } from '../../queries';

type ModuleOutputsGridProps = {
  moduleId: string;
};

export const ModuleOutputsGrid = ({ moduleId }: ModuleOutputsGridProps) => {
  const { data: outputs = [] } = ModulesQueries.useModuleOutputsQuery({
    moduleId,
  });

  // TODO: finish this

  return (
    <section>
      <Heading my='2'>Outputs</Heading>
    </section>
  );
};

import { Navigate, useParams } from "react-router-dom";
import { Heading } from "@radix-ui/themes";
import { ModuleSourcesGrid } from "../../components";

export const ModulePage = () => {
  const { moduleId } = useParams();

  if (!moduleId) return <Navigate to="/404" />;

  return (
    <div
      css={{
        padding: 12,
      }}
    >
      <Heading my="2">Sources</Heading>
      <ModuleSourcesGrid moduleId={moduleId} />
    </div>
  );
};

import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UserModulesRequest = {
  userId: string;
};

export const useUserModules = (
  request: UserModulesRequest,
  options?: UseQueryOptions,
) => {
  return useQuery({
    queryKey: ["user-modules", request],
  });
};

import { useAddModuleCombineActionMutation } from "./use-add-module-combine-action";
import { useAddModuleFilterActionMutation } from "./use-add-module-filter-action";
import { useAddModuleLimitActionMutation } from "./use-add-module-limit-action";
import { useAddModuleShuffleActionMutation } from "./use-add-module-shuffle-action";

export const useAddModuleActionMutations = () => {
  const addShuffleMutation = useAddModuleShuffleActionMutation();
  const addLimitMutation = useAddModuleLimitActionMutation();
  const addFilterMutation = useAddModuleFilterActionMutation();
  const addCombineMutation = useAddModuleCombineActionMutation();

  return {
    addShuffleMutation,
    addLimitMutation,
    addFilterMutation,
    addCombineMutation,
  };
};

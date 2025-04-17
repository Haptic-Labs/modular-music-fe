import { useAddModuleCombineActionMutation } from './use-add-module-combine-action';
import { useAddModuleFilterActionMutation } from './use-add-module-filter-action';
import { useUpsertModuleLimitActionMutation } from './use-upsert-module-limit-action';
import { useAddModuleShuffleActionMutation } from './use-add-module-shuffle-action';

export const useAddModuleActionMutations = () => {
  const addShuffleMutation = useAddModuleShuffleActionMutation();
  const upsertLimitMutation = useUpsertModuleLimitActionMutation();
  const addFilterMutation = useAddModuleFilterActionMutation();
  const addCombineMutation = useAddModuleCombineActionMutation();

  return {
    addShuffleMutation,
    upsertLimitMutation,
    addFilterMutation,
    addCombineMutation,
  };
};

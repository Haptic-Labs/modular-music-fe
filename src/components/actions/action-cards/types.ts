import { Database } from '../../../types';
import { Overwrite } from 'ts-toolbelt/out/Object/Overwrite';

export type BaseActionCardProps<
  ActionType extends
    Database['public']['Enums']['MODULE_ACTION_TYPE'] = Database['public']['Enums']['MODULE_ACTION_TYPE'],
> = {
  action: Overwrite<
    Database['public']['Tables']['module_actions']['Row'],
    { type: ActionType }
  >;
};

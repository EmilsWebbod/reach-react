import { IReachOptions, ReachError } from '@ewb/reach';

export interface IUseProps<T, S = unknown> {
  defaultBody?: Partial<T>;
  onError?: (err: ReachError | any) => void;
  onPost?: (data: T | null) => void;
  onGet?: (data: T | null) => void;
  onPatch?: (data: T | null) => void;
  onDelete?: (data: T | null) => void;
  onReach?: (method: IReachOptions['method'], data: T | null) => void;
}

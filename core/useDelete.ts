import { Dispatch, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';
import { IReachOptions, Reach } from '@ewb/reach';
import type { IUseProps } from './types';
import { ReachContext } from './ReachContext';

export type IUseDeleteProps<T> = Pick<IUseProps<T>, 'onDelete' | 'onError'>;

export interface IUseDeleteState<T, E> {
  busy: boolean;
  data?: T;
  error?: E;
}

export type IUseDeleteRet<T, E> = [
  state: IUseDeleteState<T, E>,
  del: (id: string) => Promise<T | null>,
  setState: Dispatch<SetStateAction<IUseDeleteState<T, E>>>
];

export function useDelete<T, E = any>(
  path: string,
  props?: IUseDeleteProps<T>,
  reachOptions?: Omit<IReachOptions, 'method'>
): IUseDeleteRet<T, E> {
  const service = useContext(ReachContext);
  const [state, setState] = useState<IUseDeleteState<T, E>>({ busy: false });
  const reach = useMemo(() => new Reach(service), [service]);

  const del = useCallback(
    async (id: string): Promise<T | null> => {
      try {
        setState((s) => ({ ...s, busy: true }));
        const data = await reach.api<T>(`${path}/${id}`, { ...reachOptions, method: 'DELETE' });
        setState((s) => ({ ...s, busy: false, data }));
        if (props?.onDelete) props.onDelete(data);
        return data;
      } catch (error: any) {
        setState((s) => ({ ...s, busy: false, error }));
        if (props?.onError) props.onError(error);
        return null;
      }
    },
    [path, props, reachOptions]
  );

  return useMemo(() => [state, del, setState], [state, del, setState]);
}

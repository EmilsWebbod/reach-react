import { Dispatch, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';
import { IReachOptions, Reach } from '@ewb/reach';
import type { IUseProps } from './types';
import { ReachContext } from './ReachContext';

export type IUsePostProps<T> = Pick<IUseProps<T>, 'defaultBody' | 'onPost' | 'onError'>;

export interface IUsePostState<T, E> {
  busy: boolean;
  data?: T;
  error?: E;
}

export type IUsePostRet<T, E> = [
  state: IUsePostState<T, E>,
  post: (body: Partial<T>) => Promise<T | null>,
  setState: Dispatch<SetStateAction<IUsePostState<T, E>>>
];

export function usePost<T, E = any>(
  path: string,
  props?: IUsePostProps<T>,
  reachOptions?: Omit<IReachOptions, 'method'>
): IUsePostRet<T, E> {
  const service = useContext(ReachContext);
  const [state, setState] = useState<IUsePostState<T, E>>({ busy: true, data: (props?.defaultBody as T) || undefined });
  const reach = useMemo(() => new Reach(service), [service]);

  const post = useCallback(
    async (overrideBody: Partial<T> = {}): Promise<T | null> => {
      try {
        const body = { ...(props?.defaultBody || {}), ...overrideBody };
        const data = await reach.api<T>(path, { ...reachOptions, body, method: 'POST' });
        setState((s) => ({ ...s, busy: false, data }));
        if (props?.onPost) props.onPost(data);
        return data;
      } catch (error: any) {
        setState((s) => ({ ...s, busy: false, error }));
        if (props?.onError) props.onError(error);
        return null;
      }
    },
    [path, props, reachOptions]
  );

  return useMemo(() => [state, post, setState], [state, post, setState]);
}

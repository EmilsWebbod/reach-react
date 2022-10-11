import { Dispatch, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';
import { IReachOptions, Reach } from '@ewb/reach';
import type { IUseProps } from './types';
import { ReachContext } from './ReachContext';

export interface IUseReachProps<T> extends IUseProps<T> {}

export interface IUseReachState<T, E> {
  busy: boolean;
  data?: T;
  error?: E;
}

export type IUseReachFetch<T> = <M extends IReachOptions['method']>(
  method: M,
  id: M extends 'PATCH' | 'DELETE' ? string : Partial<T>,
  body?: M extends 'PATCH' ? Partial<T> : undefined
) => Promise<T | null>;

export type IUseReachRet<T, E> = [
  state: IUseReachState<T, E>,
  fetch: IUseReachFetch<T>,
  setState: Dispatch<SetStateAction<IUseReachState<T, E>>>
];

export function useReach<T, E = any>(
  path: string,
  props?: IUseReachProps<T>,
  reachOptions?: Omit<IReachOptions, 'method'>
): IUseReachRet<T, E> {
  const service = useContext(ReachContext);
  const [state, setState] = useState<IUseReachState<T, E>>({ busy: true });
  const reach = useMemo(() => new Reach(service), [service]);

  const fetch = useCallback(
    async (
      method: IReachOptions['method'],
      idOrBody?: string | Partial<T>,
      overrideBody: Partial<T> = {}
    ): Promise<T | null> => {
      try {
        const apiPath = typeof idOrBody === 'string' ? `${path}/${idOrBody}` : path;
        const override = typeof idOrBody === 'string' ? overrideBody : idOrBody;
        const body = { ...(props?.defaultBody || {}), ...override };

        const data = await reach.api<T>(apiPath, { ...reachOptions, body, method });
        setState((s) => ({ ...s, busy: false, data }));

        if (props) {
          if (props.onReach) props.onReach(method, data);
          if (method === 'POST' && props.onPost) props.onPost(data);
          if (method === 'GET' && props.onGet) props.onGet(data);
          if (method === 'PATCH' && props.onPatch) props.onPatch(data);
          if (method === 'DELETE' && props.onDelete) props.onDelete(data);
        }

        return data;
      } catch (error: any) {
        setState((s) => ({ ...s, busy: false, error }));
        if (props?.onError) props.onError(error);
        return null;
      }
    },
    [path, props, reachOptions]
  );

  return useMemo(() => [state, fetch, setState], [state, fetch, setState]);
}

import { Dispatch, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';
import { IReachOptions, Reach } from '@ewb/reach';
import type { IUseProps } from './types';
import { ReachContext } from './ReachContext';

export type IUsePatchProps<T, E> = Pick<IUseProps<T>, 'defaultBody' | 'onPatch' | 'onError'>;

interface IUsePatchState<T, E> {
  busy: boolean;
  data?: T;
  error?: E;
}

export type IUsePatchFn<T> = <S = unknown>(id: string, body: Partial<T>) => Promise<T | null>;
export type IUsePatchRet<T, E> = [
  state: IUsePatchState<T, E>,
  patch: IUsePatchFn<T>,
  setState: Dispatch<SetStateAction<IUsePatchState<T, E>>>
];

export function usePatch<T, E = any>(
  path: string,
  props?: IUsePatchProps<T, E>,
  reachProps?: Omit<IReachOptions, 'method'>
): IUsePatchRet<T, E> {
  const service = useContext(ReachContext);
  const reach = useMemo(() => new Reach(service), [service]);
  const [state, setState] = useState<IUsePatchState<T, E>>({ busy: false });

  const patch: IUsePatchFn<T> = useCallback(
    async <S = unknown>(id: string, overrideBody: Partial<T>): Promise<T | null> => {
      try {
        setState((s) => ({ ...s, busy: true }));
        const body = { ...(props?.defaultBody || {}), ...overrideBody };
        const data = await reach.api<T>(`${path}/${id}`, { method: 'PATCH', body, ...reachProps });
        setState((s) => ({ ...s, busy: false, data }));
        if (props?.onPatch) props.onPatch(data);
        return data;
      } catch (error: any) {
        setState((s) => ({ ...s, busy: false, error }));
        if (props?.onError) props.onError(error);
        return null;
      }
    },
    [path, props, reachProps]
  );

  return useMemo(() => [state, patch, setState], [state, patch, setState]);
}

import { useCallback, useContext, useMemo, useState } from 'react';
import { IReachOptions, Reach } from '@ewb/reach';
import { ReachContext } from './ReachContext';

export interface IUsePatchProps<T, E> extends Omit<IReachOptions, 'method'> {
  onError?: <S>(error: E, state?: S) => void;
  onPatch?: <S>(data: T, state?: S) => void;
}

interface IUsePatchState<T, E> {
  busy: boolean;
  data?: T;
  error?: E;
}

export type IUsePatchFn<T> = <S>(id: string, body: Partial<T>, state?: S, overridePath?: string) => void;
export type IUsePatchRet<T, E> = [state: IUsePatchState<T, E>, patch: IUsePatchFn<T>];

export function usePatch<T, E = any>(path: string, props: IUsePatchProps<T, E> = {}): IUsePatchRet<T, E> {
  const service = useContext(ReachContext);
  const reach = useMemo(() => new Reach(service), [service]);
  const [state, setState] = useState<IUsePatchState<T, E>>({ busy: true });

  const patch: IUsePatchFn<T> = useCallback(
    async <S>(id: string, body: Partial<T>, state?: S, overridePath?: string) => {
      try {
        const apiPath = overridePath || path;
        setState((s) => ({ ...s, busy: true }));
        const data = await reach.api<T>(`${apiPath}/${id}`, { method: 'PATCH', body, ...props });
        setState((s) => ({ ...s, busy: false, data }));
        if (typeof props.onPatch === 'function') {
          props.onPatch(data, state);
        }
      } catch (error) {
        setState((s) => ({ ...s, busy: false, error }));
        if (typeof props.onError === 'function') {
          props.onError(error, state);
        }
      }
    },
    [path, props]
  );

  return useMemo(() => [state, patch], [state, patch]);
}

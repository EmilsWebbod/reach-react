import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IReachOptions, Reach } from '@ewb/reach';
import type { IUseProps } from './types';
import { ReachContext } from './ReachContext';

export interface IUseGetProps<T> extends Pick<IUseProps<T>, 'onGet' | 'onError'> {
  disableInit?: boolean;
}

export interface IUseGetState<T, E> {
  busy: boolean;
  data?: T;
  error?: E;
}

export type IUseGetRet<T, E> = [
  state: IUseGetState<T, E>,
  get: () => Promise<T | null>,
  setState: Dispatch<SetStateAction<IUseGetState<T, E>>>
];

export function useGet<T, E = any>(
  path: string,
  props?: IUseGetProps<T>,
  reachOptions?: Omit<IReachOptions, 'method'>
): IUseGetRet<T, E> {
  const init = useRef(false);
  const service = useContext(ReachContext);
  const [state, setState] = useState<IUseGetState<T, E>>({ busy: true });
  const reach = useMemo(() => new Reach(service), [service]);
  const disableInit = useMemo(() => props?.disableInit, [props]);

  const get = useCallback(async (): Promise<T | null> => {
    try {
      const data = await reach.api<T>(path, reachOptions);
      setState((s) => ({ ...s, busy: false, data }));
      if (props?.onGet) props.onGet(data);
      return data;
    } catch (error: any) {
      setState((s) => ({ ...s, busy: false, error }));
      if (props?.onError) props.onError(error);
      return null;
    }
  }, [path, props, reachOptions]);

  useEffect(() => {
    if (!init.current && !disableInit) {
      get().then();
    }
    init.current = true;
  }, [get, disableInit]);

  return useMemo(() => [state, get, setState], [state, get, setState]);
}

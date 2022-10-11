import * as React from 'react';
import { IReachOptions, Reach } from '@ewb/reach';
import { ReachContext } from './ReachContext';
import { Dispatch, SetStateAction, useMemo } from 'react';

export interface IUseReadProps extends Omit<IReachOptions, 'method'> {}

export interface IUseReadState<T, E> {
  busy: boolean;
  data?: T;
  error?: E;
}

export type IUseReadRet<T, E> = [
  busy: boolean,
  data: T | undefined,
  error: E | undefined,
  fetch: () => void,
  setState: Dispatch<SetStateAction<IUseReadState<T, E>>>
];

export function useRead<T, E = any>(path: string, props?: IUseReadProps): IUseReadRet<T, E> {
  const init = React.useRef(false);
  const service = React.useContext(ReachContext);
  const [state, setState] = React.useState<IUseReadState<T, E>>({ busy: true });
  const reach = React.useMemo(() => new Reach(service), [service]);

  const fetch = React.useCallback(async () => {
    try {
      const data = await reach.api<T>(path, props);
      setState((s) => ({ ...s, busy: false, data }));
    } catch (error) {
      setState((s) => ({ ...s, busy: false, error }));
    }
  }, [path, props]);

  React.useEffect(() => {
    if (!init.current) {
      init.current = true;
      fetch().then();
    }
  }, [fetch]);

  return useMemo(
    () => [state.busy, state.data, state.error, fetch, setState],
    [state.busy, state.data, state.error, fetch, setState]
  );
}

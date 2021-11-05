import * as React from 'react';
import { IReachOptions, Reach } from '@ewb/reach';
import { ReachContext } from './ReachContext';

interface IUseReachProps extends IReachOptions {}

interface IUseReachState<T, E> {
  busy: boolean;
  data?: T;
  error?: E;
}

export function useReach<T, E = any>(path: string, props: IUseReachProps) {
  const init = React.useRef(false);
  const service = React.useContext(ReachContext);
  const [state, setState] = React.useState<IUseReachState<T, E>>({ busy: true });
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

  return [state.busy, state.data, state.error, fetch];
}

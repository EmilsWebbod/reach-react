import * as React from 'react';
import { useCallback } from 'react';
import { IReachOptions, IReachQuery, Reach } from '@ewb/reach';
import { ReachContext } from './ReachContext';

export interface IUseSearchProps<T, RES> {
  limit?: number;
  query?: IReachOptions['query'];
  responseToData?: (body: RES) => Pick<IUseReachState<T, any>, 'count' | 'items'>;
  reachOptions?: Omit<IReachOptions, 'query'>;
  disableInit?: boolean;
}

interface IUseReachState<T, E> extends IUseReachInfo {
  busy: boolean;
  items: T[];
  searchQuery: IReachQuery;
  error?: E;
}

export interface IUseReachInfo {
  count: number;
  limit: number;
  skip: number;
}

export interface IUseReachActions<T> {
  unshift: (...items: T[]) => void;
  splice: (start: number, deleteCount?: number, ...items: T[]) => void;
  push: (...items: T[]) => void;
  map: (fn: (item: T) => T) => void;
  filter: (fn: (item: T) => boolean) => void;
  search: (fetchQuery: IReachQuery) => void;
}

export type IUseSearchRet<T, E> = [
  busy: boolean,
  data: T[],
  error: E | undefined,
  next: () => void,
  info: IUseReachInfo,
  actions: IUseReachActions<T>
];

export function useSearch<T, E = any, RES = T[]>(path: string, props: IUseSearchProps<T, RES>): IUseSearchRet<T, E> {
  const { limit = 10, responseToData, reachOptions } = props;
  const init = React.useRef(false);
  const service = React.useContext(ReachContext);
  const [state, setState] = React.useState<IUseReachState<T, E>>({
    busy: true,
    limit: limit || 10,
    skip: 0,
    count: 0,
    items: [],
    searchQuery: {},
  });
  const reach = React.useMemo(() => new Reach(service), [service]);
  const query = React.useMemo(
    () => ({
      ...props.query,
      ...state.searchQuery,
      limit: state.limit,
      skip: state.skip,
    }),
    [props.query, state.limit, state.skip, state.searchQuery]
  );

  const search = React.useCallback(
    async (skip: number, searchQuery: IReachQuery = {}) => {
      try {
        let data = await reach.api<RES | T[]>(path, {
          ...reachOptions,
          query: searchQuery ? { ...query, ...searchQuery, skip } : { ...query, skip },
        });
        const newState = { skip, searchQuery, busy: false };
        if (typeof responseToData === 'function') {
          const { count, items } = responseToData(data as RES);
          setState((s) => ({ ...s, ...newState, count, items: skip ? [...s.items, ...items] : items }));
          return;
        }
        if (!Array.isArray(data)) {
          throw new Error('useSearch error. data response is not typeof array. Use responseToData to parse response');
        }
        setState((s) => ({ ...s, ...newState, items: skip ? [...s.items, ...(data as T[])] : (data as T[]) }));
      } catch (error) {
        setState((s) => ({ ...s, busy: false, error }));
      }
    },
    [path, query, responseToData, reachOptions]
  );

  const next = useCallback(async () => {
    if (state.items.length < state.count) {
      setState((s) => ({ ...s, busy: true }));
      await search(state.skip + state.limit);
    }
  }, [state.items.length, state.count, search, state.skip, state.limit]);

  const info = React.useMemo(
    () => ({
      limit: state.limit,
      skip: state.skip,
      count: state.count,
    }),
    [state.limit, state.skip, state.count]
  );

  const actions = React.useMemo(
    () => ({
      unshift: (...items: T[]) => {
        setState((s) => ({ ...s, items: [...items, ...s.items], count: s.count + items.length }));
      },
      splice: (start: number, deleteCount: number = 1, ...items: T[]) => {
        setState((s) => {
          s.items.splice(start, deleteCount, ...items);
          return { ...s, items: [...s.items], count: s.count - deleteCount + items.length };
        });
      },
      push: (...items: T[]) => {
        setState((s) => {
          return { ...s, items: [...s.items, ...items], count: s.count + items.length };
        });
      },
      search: (query: IReachQuery) => search(0, query),
      map: (fn: (items: T) => T) => setState((s) => ({ ...s, items: s.items.map(fn) })),
      filter: (fn: (item: T) => boolean) => setState((s) => ({ ...s, items: s.items.filter(fn) })),
    }),
    [search]
  );

  React.useEffect(() => {
    if (!init.current && !props.disableInit) {
      init.current = true;
      search(0).then();
    }
  }, [search, props.disableInit]);

  return React.useMemo(
    () => [state.busy, state.items, state.error, next, info, actions],
    [state.busy, state.items, state.error, next, info, actions]
  );
}

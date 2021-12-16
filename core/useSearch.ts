import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IReachOptions, IReachQuery, Reach } from '@ewb/reach';
import { ReachContext } from './ReachContext';

export interface IUseSearchProps<T, RES> {
  limit?: number;
  query?: IReachOptions['query'];
  responseToData?: (body: RES, state: IUseSearchState<T, any>) => Partial<IUseSearchState<T, any>>;
  reachOptions?: Omit<IReachOptions, 'query'>;
  disableInit?: boolean;
}

interface IUseSearchState<T, E> extends IUseSearchInfo {
  busy: boolean;
  items: T[];
  searchQuery: IReachQuery;
  error?: E;
}

export interface IUseSearchInfo {
  count: number;
  limit: number;
  skip: number;
}

export interface IUseSearchActions<T> {
  unshift: (...items: T[]) => void;
  splice: (start: number, deleteCount?: number, ...items: T[]) => void;
  push: (...items: T[]) => void;
  map: (fn: (item: T) => T) => void;
  filter: (fn: (item: T) => boolean) => void;
  search: (fetchQuery: IReachQuery) => Promise<T[]>;
}

export type IUseSearchNextFn<T> = (searchQuery?: IReachQuery) => Promise<T[] | null>;

export type IUseSearchRet<T, E> = [
  busy: boolean,
  data: T[],
  error: E | undefined,
  next: IUseSearchNextFn<T>,
  info: IUseSearchInfo,
  actions: IUseSearchActions<T>
];

export function useSearch<T, E = any, RES = T[]>(path: string, props: IUseSearchProps<T, RES>): IUseSearchRet<T, E> {
  const { limit = 10, responseToData, reachOptions } = props;
  const init = useRef(false);
  const service = useContext(ReachContext);
  const [state, setState] = useState<IUseSearchState<T, E>>({
    busy: true,
    limit: limit || 10,
    skip: 0,
    count: 0,
    items: [],
    searchQuery: {},
  });
  const reach = useMemo(() => new Reach(service), [service]);
  const query = useMemo(
    () => ({
      ...props.query,
      ...state.searchQuery,
      limit: state.limit,
      skip: state.skip,
    }),
    [props.query, state.limit, state.skip, state.searchQuery]
  );

  const search = useCallback(
    async (skip: number, searchQuery: IReachQuery = {}): Promise<T[]> => {
      try {
        let data = await reach.api<RES | T[]>(path, {
          ...reachOptions,
          query: searchQuery ? { ...query, ...searchQuery, skip } : { ...query, skip },
        });
        const newState = { skip, searchQuery, busy: false };
        if (typeof responseToData === 'function') {
          let retItems: T[] = [];
          setState((s) => {
            const { items, ...responseState } = responseToData(data as RES, s);
            if (items) {
              retItems = items;
            }
            return {
              ...s,
              ...responseState,
              items: items ? (skip ? [...s.items, ...items] : items) : s.items,
              busy: false,
            };
          });
          return retItems;
        }
        if (!Array.isArray(data)) {
          throw new Error('useSearch error. data response is not typeof array. Use responseToData to parse response');
        }
        setState((s) => ({ ...s, ...newState, items: skip ? [...s.items, ...(data as T[])] : (data as T[]) }));
        return data as T[];
      } catch (error) {
        setState((s) => ({ ...s, busy: false, error }));
        return [] as T[];
      }
    },
    [path, query, responseToData, reachOptions]
  );

  const next: IUseSearchNextFn<T> = useCallback(
    async (searchQuery?: IReachQuery) => {
      if (state.items.length < state.count) {
        setState((s) => ({ ...s, busy: true }));
        return search(state.skip + state.limit, searchQuery);
      }
      return null;
    },
    [state.items.length, state.count, search, state.skip, state.limit]
  );

  const info: IUseSearchInfo = useMemo(
    () => ({
      limit: state.limit,
      skip: state.skip,
      count: state.count,
    }),
    [state.limit, state.skip, state.count]
  );

  const actions: IUseSearchActions<T> = useMemo(
    () => ({
      unshift: (...items: T[]) => {
        setState((s) => ({ ...s, items: [...items, ...s.items], count: s.count + items.length }));
      },
      splice: (start: number, deleteCount: number = 1, ...items: T[]) => {
        setState((s) => {
          const newItems = [...s.items];
          newItems.splice(start, deleteCount, ...items);
          return { ...s, items: newItems, count: s.count - deleteCount + items.length };
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

  useEffect(() => {
    if (!init.current && !props.disableInit) {
      init.current = true;
      search(0).then();
    }
  }, [search, props.disableInit]);

  return useMemo(
    () => [state.busy, state.items, state.error, next, info, actions],
    [state.busy, state.items, state.error, next, info, actions]
  );
}

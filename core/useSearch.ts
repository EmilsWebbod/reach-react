import { IReachOptions, IReachQuery, Reach } from '@ewb/reach';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ReachContext } from './ReachContext';

const SKIP = 0;
const LIMIT = 10;
const COUNT = 0;
const LIMIT_KEY = 'limit';
const SKIP_KEY = 'skip';
const COUNT_HEADER = 'X-Total-Count';

export interface IUseSearchProps<T, E, RES> {
  limit?: number;
  defaultSkip?: number;
  skip?: number;
  count?: number;
  // Skips with 1 + 1 instead of skip + limit
  skipPages?: boolean;
  query?: IReachOptions['query'];
  responseToData?: (
    body: RES,
    state: IUseSearchState<T, E, RES>,
    response: Response,
    paginate: boolean
  ) => Partial<IUseSearchState<T, E, RES>> & Pick<IUseSearchState<T, E, RES>, 'items'>;
  reachOptions?: Omit<IReachOptions, 'query'>;
  disableInit?: boolean;
  defaultItems?: T[];
  skipKey?: string;
  limitKey?: string;
  countHeader?: string;
}

export interface IUseSearchState<T, E, RES> extends IUseSearchInfo<RES> {
  busy: boolean;
  items: T[];
  searchQuery: IReachQuery;
  error?: E | null;
}

export interface IUseSearchInfo<RES> {
  count: number;
  limit: number;
  skip: number;
  hasFetched: boolean;
  json?: RES;
  response?: Response;
}

export interface IUseSearchActions<T> {
  unshift: (...items: T[]) => void;
  splice: (start: number, deleteCount?: number, ...items: T[]) => void;
  push: (...items: T[]) => void;
  map: (fn: (item: T) => T) => void;
  filter: (fn: (item: T) => boolean) => void;
  search: (fetchQuery: IReachQuery) => Promise<T[]>;
}

export type IUseSearchNextFn<T> = (fetchQuery?: IReachQuery) => Promise<T[] | null>;

export type IUseSearchRet<T, E, RES> = [
  busy: boolean,
  data: T[],
  error: E | undefined | null,
  next: IUseSearchNextFn<T>,
  info: IUseSearchInfo<RES>,
  actions: IUseSearchActions<T>
];

const toInitialState = <T, E, RES>(props: IUseSearchProps<T, E, RES>): IUseSearchState<T, E, RES> => ({
  busy: !props.disableInit,
  limit: props.limit || LIMIT,
  skip: props.skip || props.defaultSkip || SKIP,
  count: props.count || COUNT,
  items: props.defaultItems || [],
  searchQuery: props.query || {},
  hasFetched: false,
});

const toInitialQuery = <T, E, RES>(state: IUseSearchState<T, E, RES>, skipKey: string, limitKey = LIMIT_KEY) => ({
  ...state.searchQuery,
  [limitKey]: state.limit,
  [skipKey]: state.skip,
});

export function useSearch<T, E = any, RES = T[]>(
  path: string,
  props: IUseSearchProps<T, E, RES>
): IUseSearchRet<T, E, RES> {
  const { skipKey = SKIP_KEY, countHeader = COUNT_HEADER, responseToData, reachOptions, skipPages } = props;
  const init = useRef(false);
  const service = useContext(ReachContext);
  const initialState = useMemo(() => toInitialState<T, E, RES>(props), [props]);
  const [state, setState] = useState<IUseSearchState<T, E, RES>>(initialState);
  const _skip = useRef<number>(state.skip);
  const initialQuery = useRef(toInitialQuery(state, skipKey, props.limitKey));
  const searchQuery = useRef(initialQuery.current);
  const reach = useMemo(() => new Reach(service), [service]);

  const search = useCallback(
    async (skip: number, reachQuery?: IReachQuery): Promise<T[]> => {
      try {
        const paginate = _skip.current < skip;
        if (!paginate) {
          searchQuery.current = { ...initialQuery.current, ...(reachQuery || {}) };
        }
        const querySkip = skipPages ? skip : skip * state.limit;
        const query = reachQuery
          ? { ...initialQuery.current, ...reachQuery, [skipKey]: querySkip }
          : { ...initialQuery.current, [skipKey]: querySkip };
        const response = await reach.api<Response>(path, { ...reachOptions, query, noJson: true });
        const json = (await response.json()) as RES;
        const newState = getNewStateFromResponse<T, E, RES>(response, json, querySkip, query, countHeader);
        const toNewItems = (s: IUseSearchState<T, E, RES>, items: T[]) =>
          items ? (paginate ? [...s.items, ...items] : items) : s.items;

        if (typeof responseToData === 'function') {
          let retItems: T[] = [];
          setState((s) => {
            const { items, ...responseState } = responseToData(json, { ...s, ...newState }, response, paginate);
            if (items) {
              retItems = items;
            }
            return { ...s, ...newState, ...responseState, items: toNewItems(s, items) };
          });
          return retItems;
        }
        if (!Array.isArray(json)) {
          throw new Error('useSearch error. json response is not typeof array. Use responseToData to parse response');
        }
        setState((s) => ({ ...s, ...newState, items: toNewItems(s, json) }));
        return json;
      } catch (error: any) {
        setState((s) => ({ ...s, busy: false, error }));
        return [] as T[];
      }
    },
    [path, responseToData, reachOptions, skipKey, countHeader, state.limit, skipPages]
  );

  const next: IUseSearchNextFn<T> = useCallback(
    async (searchQuery?: IReachQuery) => {
      if (state.items.length < state.count) {
        setState((s) => ({ ...s, busy: true }));
        return search(++_skip.current, searchQuery);
      }
      return null;
    },
    [state.items.length, state.count, search]
  );

  const info: IUseSearchInfo<RES> = useMemo(
    () => ({
      limit: state.limit,
      skip: state.skip,
      count: state.count,
      hasFetched: state.hasFetched,
      json: state.json,
    }),
    [state.limit, state.skip, state.count, state.hasFetched, state.json]
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
      search: (query: IReachQuery) => search(props.defaultSkip || 0, query),
      map: (fn: (items: T) => T) => setState((s) => ({ ...s, items: s.items.map(fn) })),
      filter: (fn: (item: T) => boolean) => setState((s) => ({ ...s, items: s.items.filter(fn) })),
    }),
    [search, props.defaultSkip]
  );

  useEffect(() => {
    if (!init.current && !props.disableInit) {
      search(0).then();
    }
    init.current = true;
  }, [search, props.disableInit]);

  return useMemo(
    () => [state.busy, state.items, state.error, next, info, actions],
    [state.busy, state.items, state.error, next, info, actions]
  );
}

function getNewStateFromResponse<T, E, RES>(
  response: Response,
  json: RES,
  skip: number,
  searchQuery: object,
  countHeader?: string
): Partial<IUseSearchState<T, E, RES>> {
  const newState: Partial<IUseSearchState<T, E, RES>> = {
    skip,
    searchQuery,
    busy: false,
    hasFetched: true,
    error: null,
    json,
  };
  if (countHeader) {
    const count = Number(response.headers.get(countHeader));
    if (count && !isNaN(count)) {
      newState.count = count;
    }
  }
  return newState;
}

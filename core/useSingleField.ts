import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Reach } from '@ewb/reach';
import { ReachContext } from './ReachContext';

interface State<T extends object, K extends Path<T> & string, V extends PathValue<T, Path<T>>, E> {
  error?: E;
  busy: boolean;
  value: V;
}

type IUserSingleFieldRet<T extends object, K extends Path<T> & string, V extends PathValue<T, Path<T>>, E> = [
  busy: boolean,
  state: V,
  error: E | undefined,
  setValue: (value: V) => void,
  save: () => void
];

export function useSingleField<T extends object, K extends Path<T> & string, V extends PathValue<T, K>, E>(
  path: string,
  data: T,
  key: K
): IUserSingleFieldRet<T, K, V, E> {
  const value = useMemo(() => getValue(data, key.split('.') as (keyof T)[]) as V, [data, key]);
  const ref = useRef(value);
  const service = useContext(ReachContext);
  const reach = useMemo(() => new Reach(service), [service]);
  const [state, setState] = useState<State<T, K, V, E>>({
    value: ref.current,
    busy: false,
  });

  const save = useCallback(async () => {
    try {
      setState((s) => ({ ...s, busy: true }));
      await reach.api(path, { method: 'PATCH', body: { [key]: ref.current } });
      setState((s) => ({ ...s, busy: false, value: ref.current }));
    } catch (error) {
      setState((s) => ({ ...s, busy: false, error }));
    }
  }, [path, reach, key]);

  const setValue = useCallback((value: V) => {
    ref.current = value;
    setState((s) => ({ ...s, value }));
  }, []);

  useEffect(() => {
    if (value !== ref.current) {
      ref.current = value;
      setState((s) => ({ ...s, value }));
    }
  }, [value]);

  return [state.busy, state.value, state.error, setValue, save];
}

function getValue<T, K extends keyof T, V extends any>(data: T, arr: K[]): V {
  const key = arr[0];
  if (key && data[key]) {
    if (typeof data[key] === 'object') return getValue(data[key], arr.slice(1) as any) as V;
  }
  return data[key] as V;
}

// Types to create dot.paths and get value of that path
export type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends ArrayLike<any>
      ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}`
      : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never;

export type Path<T> = PathImpl<T, keyof T> | keyof T;

export type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

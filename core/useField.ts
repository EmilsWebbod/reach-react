import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Reach } from '@ewb/reach';
import { ReachContext } from './ReachContext';
import { IUseFieldEdit, IUseFieldRet, IUseFieldValueRet } from './useFields';
import { IUseCrudRet } from './useCrud';

interface State<V, E> {
  error?: E;
  busy: boolean;
  value: V;
}

type IUserFieldRet<V, E, P> = [
  busy: boolean,
  state: IUseFieldValueRet<V> & P,
  error: E | undefined,
  setValue: (value: V, disableAutoSave?: boolean) => void
];

export interface IUseFieldProps {
  disableAutoSave?: boolean;
}

export function useField<T extends object, K extends keyof T & string, E, P>(
  crud: IUseFieldRet<T, E, P>,
  key: K,
  props: IUseFieldProps = {}
): IUserFieldRet<T[K], E, P> {
  const { path, data, fields, idKey } = crud.state;
  const value = useMemo(() => getDotValue(data, key.split('.') as (keyof T)[]) as T[K], [data, key]);
  const ref = useRef(value);
  const service = useContext(ReachContext);
  const reach = useMemo(() => new Reach(service), [service]);
  const [state, setState] = useState<State<T[K], E>>({
    value: ref.current,
    busy: false,
  });
  const field = useMemo(() => {
    if (!fields[key as keyof T]) {
      throw new Error(`useField was used with edit field that was not defined. Add ${key} to field object`);
    }
    const id = `${data[idKey]}-${key}`;
    const edited = ref.current !== state.value;
    // @ts-ignore
    return { ...fields[key]!, id, edited, value: state.value };
  }, [state.value, idKey]);

  const _id = data[idKey];
  const save = useCallback(
    async (v = ref.current) => {
      try {
        setState((s) => ({ ...s, busy: true }));
        await reach.api(`${path}/${_id}`, { method: 'PATCH', body: { [key]: v } });
        ref.current = v;
        setState((s) => ({ ...s, busy: false, value: v }));
      } catch (error) {
        setState((s) => ({ ...s, busy: false, error }));
      }
    },
    [path, reach, _id, key]
  );

  const setValue = useCallback(
    (value: T[K], disableAutoSave = props.disableAutoSave) => {
      ref.current = value;
      if (!disableAutoSave) {
        return save(ref.current);
      }
    },
    [save]
  );

  useEffect(() => {
    if (value !== ref.current) {
      ref.current = value;
      setState((s) => ({ ...s, value }));
    }
  }, [value]);

  return [state.busy, field, state.error, setValue];
}

function getDotValue<T, K extends keyof T, V extends any>(data: T, arr: K[]): V {
  const key = arr[0];
  if (key && data[key]) {
    if (typeof data[key] === 'object') return getDotValue(data[key], arr.slice(1) as any) as V;
  }
  return data[key] as V;
}

// Types to create dot.paths and get value of that path
export type DotObject<T> = {
  [K in Path<T>]: PathValue<T, K>;
};
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

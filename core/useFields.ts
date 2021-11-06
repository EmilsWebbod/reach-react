import { useCallback, useMemo } from 'react';
import { IUseCrudProps, IUseCrudSaveFn, IUseCrudSetDataFn, IUseCrudSetFn, IUseCrudState, useCrud } from './useCrud';

export type IUseFieldEdit<T extends object, P extends object> = {
  [K in keyof T]?: {
    defaultValue: T[K];
  } & P;
};

export interface IUseFieldState<T extends object, E> extends Omit<IUseCrudState<T, E>, 'data'> {
  data: T;
}

export type IUseFieldValueRet<T extends object, K extends keyof T, P extends object> = {
  defaultValue: T[K];
  value: T[K];
} & P;

export type IUseFieldRet<T extends object, P extends object, E> = [
  busy: IUseFieldState<T, E>,
  getField: <K extends keyof T>(key: K) => IUseFieldValueRet<T, K, P>,
  setField: IUseCrudSetFn<T>,
  save: IUseCrudSaveFn,
  set: IUseCrudSetDataFn<T>
];

export function useFields<T extends object, P extends object, E = any>(
  path: string,
  data: Partial<T>,
  fields: IUseFieldEdit<T, P>,
  props: IUseCrudProps<T>
): IUseFieldRet<T, P, E> {
  const defaultData = useMemo(() => {
    const newData: Partial<T> = {};
    for (const key in data) {
      newData[key] = data[key];
    }
    for (const key in fields) {
      if (!newData[key] && fields[key]) {
        newData[key] = fields[key]!.defaultValue;
      }
    }
    return newData as T;
  }, [fields, data]);

  const [state, set, save, setData] = useCrud<T, E>(path, defaultData, {
    disableAutoSave: false,
    ...props,
  });

  const getField = useCallback(
    <K extends keyof T>(key: K) => {
      if (!fields[key]) {
        throw new Error(`useField was used with edit field that was not defined. Add ${key} to field object`);
      }
      return { ...fields[key]!, value: state.data[key] } as IUseFieldValueRet<T, K, P>;
    },
    [state, fields]
  );

  return useMemo(
    () => [state as IUseFieldState<T, E>, getField, set, save, setData],
    [state, getField, set, save, setData]
  );
}

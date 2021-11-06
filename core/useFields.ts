import { useCallback, useMemo } from 'react';
import { IUseCrudProps, IUseCrudSaveFn, IUseCrudSetDataFn, IUseCrudSetFn, IUseCrudState, useCrud } from './useCrud';

export type IUseFieldEdit<T extends object, P extends {}> = {
  [K in keyof T]?: IUseFieldValueIn<T, K> & P;
};

export interface IUseFieldState<T extends {}, E> extends Omit<IUseCrudState<T, E>, 'data'> {
  data: T;
}

export type IUseFieldValueIn<T extends object, K extends keyof T> = {
  defaultValue: T[K];
};
export interface IUseFieldValueRet<T extends object, K extends keyof T> extends IUseFieldValueIn<T, K> {
  id: string;
  edited: boolean;
  value: T[K];
}

export type IUseFieldRet<T extends object, E, P extends {}> = {
  state: IUseFieldState<T, E>;
  getField: <K extends keyof T>(key: K) => IUseFieldValueRet<T, K> & P;
  setField: IUseCrudSetFn<T>;
  save: IUseCrudSaveFn;
  setData: IUseCrudSetDataFn<T>;
};

export function useFields<T extends object, E, P extends {}>(
  path: string,
  data: Partial<T>,
  fields: IUseFieldEdit<T, P>,
  props: IUseCrudProps<T>
): IUseFieldRet<T, E, P> {
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

  const [state, setField, save, setData] = useCrud<T, E>(path, defaultData, {
    disableAutoSave: false,
    ...props,
  });

  const getField = useCallback(
    <K extends keyof T>(key: K) => {
      if (!fields[key]) {
        throw new Error(`useField was used with edit field that was not defined. Add ${key} to field object`);
      }
      const id = `${state.data[props.idKey]}-${key}`;
      const edited = Boolean(state.edited[key]);
      return { ...fields[key]!, id, edited, value: state.data[key] } as IUseFieldValueRet<T, K> & P;
    },
    [state, props.idKey, fields]
  );

  return useMemo(
    () => ({ state: state as IUseFieldState<T, E>, getField, setField, save, setData }),
    [state, getField, setField, save, setData]
  );
}

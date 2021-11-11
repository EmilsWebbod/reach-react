import { useCallback, useMemo } from 'react';
import { IUseCrudProps, IUseCrudSaveFn, IUseCrudSetDataFn, IUseCrudSetFn, IUseCrudState, useCrud } from './useCrud';

export type IUseFieldEdit<T extends object, P extends {}> = {
  [K in keyof T]?: IUseFieldValueIn<T[K]> & P;
};

export interface IUseFieldState<T extends object, E> extends Omit<IUseCrudState<T, E>, 'data'> {
  data: T;
}

export type IUseFieldValueIn<V> = {
  defaultValue: V;
};
export interface IUseFieldValueRet<V> extends IUseFieldValueIn<V> {
  id: string;
  edited: boolean;
  value: V;
}

export type IUseFieldRet<T extends object, E, P extends {}, RET = T> = {
  state: IUseFieldState<T, E> & { fields: IUseFieldEdit<T, P>; idKey: keyof T };
  getField: <K extends keyof T>(key: K) => IUseFieldValueRet<T[K]> & P;
  setField: IUseCrudSetFn<T>;
  save: IUseCrudSaveFn<RET>;
  setData: IUseCrudSetDataFn<T>;
};

export function useFields<T extends object, E, P extends {}, RET = T>(
  path: string,
  data: Partial<T>,
  fields: IUseFieldEdit<T, P>,
  props: IUseCrudProps<T>
): IUseFieldRet<T, E, P, RET> {
  const idKey = props.idKey;
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

  const [state, setField, save, setData] = useCrud<T, E, RET>(path, defaultData, {
    disableAutoSave: false,
    ...props,
  });

  const getField = useCallback(
    <K extends keyof T>(key: K) => {
      if (!fields[key]) {
        throw new Error(`useField was used with edit field that was not defined. Add ${key} to field object`);
      }
      const id = `${state.data[idKey]}-${key}`;
      const edited = Boolean(state.edited[key]);
      return { ...fields[key]!, id, edited, value: state.data[key] } as IUseFieldValueRet<T[K]> & P;
    },
    [state, idKey, fields]
  );

  return useMemo(
    () => ({ state: { ...(state as IUseFieldState<T, E>), fields, idKey }, getField, setField, save, setData }),
    [state, fields, idKey, getField, setField, save, setData]
  );
}

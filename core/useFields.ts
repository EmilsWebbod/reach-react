import { useCallback, useMemo } from 'react';
import {
  IUseCrudActions,
  IUseCrudProps,
  IUseCrudSaveFn,
  IUseCrudSetDataFn,
  IUseCrudSetFn,
  IUseCrudState,
  useCrud,
} from './useCrud';

export type IUseFieldSchema<T extends object, P extends {}> = {
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
  state: IUseFieldState<T, E> & { schema: IUseFieldSchema<T, P>; idKey: keyof T };
  getField: <K extends keyof T>(key: K) => IUseFieldValueRet<T[K]> & P;
  setField: IUseCrudSetFn<T>;
  save: IUseCrudSaveFn<RET>;
  setData: IUseCrudSetDataFn<T>;
  actions: IUseCrudActions;
};

export function useFields<T extends object, E, P extends {}, RET = T>(
  path: string,
  data: Partial<T>,
  schema: IUseFieldSchema<T, P>,
  props: IUseCrudProps<T>
): IUseFieldRet<T, E, P, RET> {
  const idKey = props.idKey;
  const defaultData = useMemo(() => {
    const newData: Partial<T> = {};
    for (const key in data) {
      newData[key] = data[key];
    }
    for (const key in schema) {
      if (!newData[key] && schema[key]) {
        newData[key] = schema[key]!.defaultValue;
      }
    }
    return newData as T;
  }, [schema, data]);

  const [state, setField, save, setData, actions] = useCrud<T, E, RET>(path, defaultData, {
    disableAutoSave: false,
    ...props,
  });

  const getField = useCallback(
    <K extends keyof T>(key: K) => {
      if (!schema[key]) {
        throw new Error(`useField was used with edit field that was not defined. Add ${key} to field object`);
      }
      const id = `${state.data[idKey]}-${key}`;
      const edited = Boolean(state.edited[key]);
      return { ...schema[key]!, id, edited, value: state.data[key] } as IUseFieldValueRet<T[K]> & P;
    },
    [state, idKey, schema]
  );

  return useMemo(
    () => ({
      state: { ...(state as IUseFieldState<T, E>), schema, idKey },
      getField,
      setField,
      save,
      setData,
      actions,
    }),
    [state, schema, idKey, getField, setField, save, setData, actions]
  );
}

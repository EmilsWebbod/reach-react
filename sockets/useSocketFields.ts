import { IUseCrudProps, IUseFieldEdit, IUseFieldRet, useFields } from '../core';
import { useMemo } from 'react';
import { IUseSocketProps, userSocketPropsToParams, useSocketNamespace } from './useSocketNamespace';

interface FieldsProps<T extends object, P extends object> {
  fields: IUseFieldEdit<T, P>;
  props: IUseCrudProps<T>;
}

export function useSocketFields<T extends object, P extends object, E = any>(
  path: string,
  data: Partial<T>,
  fields: FieldsProps<T, P>,
  socketProps: IUseSocketProps<T, any[]>
): IUseFieldRet<T, P, E> {
  const [state, getField, set, save, setData] = useFields(path, data, fields.fields, fields.props);

  useSocketNamespace(
    ...userSocketPropsToParams<T, any[]>(socketProps, state.data),
    socketProps.toData,
    socketProps.filter(state.data)
  );

  return useMemo(() => [state, getField, set, save, setData], [state, getField, set, save, setData]);
}

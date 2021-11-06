import { IUseCrudProps, IUseFieldEdit, IUseFieldRet, useFields } from '../core';
import { useMemo } from 'react';
import { useSocketNamespace } from './useSocketNamespace';
import { SocketConnectionBroadcastFn, SocketConnectionFilterFn } from './SocketConnection';

interface FieldsProps<T extends object, P extends object> {
  fields: IUseFieldEdit<T, P>;
  props: IUseCrudProps<T>;
}

interface SocketProps<T extends object, B extends any[]> {
  namespace: string | ((data: T) => string);
  event: string;
  toData: (...data: B) => Partial<T>;
  filter: SocketConnectionFilterFn<B>;
}

export function useSocketFields<T extends object, P extends object, E = any>(
  path: string,
  data: Partial<T>,
  fields: FieldsProps<T, P>,
  socketProps: SocketProps<T, any[]>
): IUseFieldRet<T, P, E> {
  const [state, getField, set, save, setData] = useFields(path, data, fields.fields, fields.props);

  useSocketNamespace(
    typeof socketProps.namespace === 'function' ? socketProps.namespace(state.data) : socketProps.namespace,
    socketProps.event,
    (...event) => setData(socketProps.toData(...event)),
    socketProps.filter
  );

  return useMemo(() => [state, getField, set, save, setData], [state, getField, set, save, setData]);
}

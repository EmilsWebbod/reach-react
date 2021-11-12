import { IUseCrudProps, IUseFieldSchema, IUseFieldRet, useFields } from '../core';
import { IUseSocketProps, userSocketPropsToParams, useSocketNamespace } from './useSocketNamespace';

export interface IUseSocketFieldssProps<T extends object, P extends object> {
  schema: IUseFieldSchema<T, P>;
  props: IUseCrudProps<T>;
}

export function useSocketFields<T extends object, E, P extends {}, B extends any[]>(
  path: string,
  data: Partial<T>,
  fields: IUseSocketFieldssProps<T, P>,
  socketProps: IUseSocketProps<T, B>
): IUseFieldRet<T, E, P> {
  const field = useFields<T, E, P>(path, data, fields.schema, fields.props);

  useSocketNamespace(
    ...userSocketPropsToParams<T, B>(socketProps, field.state.data),
    (...events) => {
      const data = socketProps.toData(...events);
      field.setData(data);
    },
    socketProps.filter(field.state.data)
  );

  return field;
}

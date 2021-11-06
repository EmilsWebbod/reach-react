import { IUseCrudProps, IUseFieldEdit, IUseFieldRet, IUseFieldValueIn, IUseFieldValueRet, useFields } from '../core';
import { IUseSocketProps, userSocketPropsToParams, useSocketNamespace } from './useSocketNamespace';

interface FieldsProps<T extends object, P extends object> {
  fields: IUseFieldEdit<T, P>;
  props: IUseCrudProps<T>;
}

export function useSocketFields<T extends object, E, P extends {}, B extends any[]>(
  path: string,
  data: Partial<T>,
  fields: FieldsProps<T, P>,
  socketProps: IUseSocketProps<T, B>
): IUseFieldRet<T, E, P> {
  const field = useFields<T, E, P>(path, data, fields.fields, fields.props);

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

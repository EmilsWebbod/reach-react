import { useGet, IUseGetRet, IUseGetProps } from '../core';
import { IUseSocketProps, userSocketPropsToParams, useSocketNamespace } from './useSocketNamespace';

export type IUseSocketGetProps<T> = IUseGetProps<T>;

export function useSocketGet<T extends object, E, B extends any[]>(
  path: string,
  socketProps: IUseSocketProps<T, B>,
  readProps: IUseSocketGetProps<T>
): IUseGetRet<T, E> {
  const field = useGet<T, E>(path, readProps);

  useSocketNamespace(
    ...userSocketPropsToParams<T, B>(socketProps, field[1] as T),
    (...events) => {
      const data = socketProps.toData(...events) as T;
      field[2]((s) => ({ ...s, data: { ...s.data, ...data } }));
    },
    socketProps.filter(field[1] as T)
  );

  return field;
}

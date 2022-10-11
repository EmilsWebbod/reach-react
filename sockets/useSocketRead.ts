import { useRead, IUseReadRet, IUseReadProps } from '../core';
import { IUseSocketProps, userSocketPropsToParams, useSocketNamespace } from './useSocketNamespace';

export interface IUseSocketReadProps extends IUseReadProps {}

export function useSocketRead<T extends object, E, B extends any[]>(
  path: string,
  socketProps: IUseSocketProps<T, B>,
  readProps: IUseSocketReadProps
): IUseReadRet<T, E> {
  const field = useRead<T, E>(path, readProps);

  useSocketNamespace(
    ...userSocketPropsToParams<T, B>(socketProps, field[1] as T),
    (...events) => {
      const data = socketProps.toData(...events) as T;
      field[4]((s) => ({ ...s, data: { ...s.data, ...data } }));
    },
    socketProps.filter(field[1] as T)
  );

  return field;
}

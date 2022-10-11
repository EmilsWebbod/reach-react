import { FormEvent, useCallback, useMemo } from 'react';
import { IReachOptions } from '@ewb/reach';
import { IUseReachProps, IUseReachState, useReach } from './useReach';

export type IUseReachFormOnSubmitFn<T> = (e: FormEvent<HTMLFormElement>) => Promise<T | null>;
export type IUseReachFormGetIdAndBodyFn<T> = (data: Partial<T>) => IUseReachFormIdAndBody<T>;
export type IUseReachFormIdAndBody<T> = { id?: string | null; body: Partial<T> };

export function useReachForm<T, E = any>(
  path: string,
  getIdAndBody: IUseReachFormGetIdAndBodyFn<T>,
  props?: IUseReachProps<T>,
  reachOptions?: Omit<IReachOptions, 'method'>
): [state: IUseReachState<T, E>, onSubmit: IUseReachFormOnSubmitFn<T>] {
  const [state, reach] = useReach<T, E>(path, props, reachOptions);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const object = Object.fromEntries(new FormData(e.currentTarget) as any) as Partial<T>;
      const { id, body } = getIdAndBody(object);
      return id ? reach('PATCH', id, body) : reach('POST', body);
    },
    [path, getIdAndBody, reach]
  );

  return useMemo(() => [state, onSubmit], [state, onSubmit]);
}

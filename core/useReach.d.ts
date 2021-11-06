import { IReachOptions } from '@ewb/reach';
export interface IUseReachProps extends IReachOptions {
}
export declare type IUseReachRet<T, E> = [busy: boolean, data: T | undefined, error: E | undefined, fetch: () => void];
export declare function useReach<T, E = any>(path: string, props?: IUseReachProps): IUseReachRet<T, E>;

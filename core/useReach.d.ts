import { IReachOptions } from '@ewb/reach';
interface IUseReachProps extends IReachOptions {
}
export declare function useReach<T, E = any>(path: string, props?: IUseReachProps): [boolean, T | undefined, E | undefined, () => void];
export {};

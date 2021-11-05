import { IReachOptions, IReachQuery } from '@ewb/reach';
export interface IUseReachProps<T, RES> {
    limit?: number;
    query?: IReachOptions['query'];
    responseToData?: (body: RES) => Pick<IUseReachState<T, any>, 'count' | 'items'>;
    reachOptions?: Omit<IReachOptions, 'query'>;
}
interface IUseReachState<T, E> extends IUseReachInfo {
    busy: boolean;
    items: T[];
    searchQuery: IReachQuery;
    error?: E;
}
export interface IUseReachInfo {
    count: number;
    limit: number;
    skip: number;
}
export interface IUseReachActions<T> {
    unshift: (...items: T[]) => void;
    splice: (start: number, deleteCount?: number, ...items: T[]) => void;
    push: (...items: T[]) => void;
    search: (fetchQuery: IReachQuery) => void;
}
export declare function useSearch<T, E = any, RES = T[]>(path: string, props: IUseReachProps<T, RES>): [boolean, T[], E | undefined, () => void, IUseReachInfo, IUseReachActions<T>];
export {};

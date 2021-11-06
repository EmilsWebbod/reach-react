import { IReachOptions, IReachQuery } from '@ewb/reach';
export interface IUseSearchProps<T, RES> {
    limit?: number;
    query?: IReachOptions['query'];
    responseToData?: (body: RES) => Pick<IUseReachState<T, any>, 'count' | 'items'>;
    reachOptions?: Omit<IReachOptions, 'query'>;
    disableInit?: boolean;
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
export declare type IUseSearchRet<T, E> = [
    busy: boolean,
    data: T[],
    error: E | undefined,
    next: () => void,
    info: IUseReachInfo,
    actions: IUseReachActions<T>
];
export declare function useSearch<T, E = any, RES = T[]>(path: string, props: IUseSearchProps<T, RES>): IUseSearchRet<T, E>;
export {};

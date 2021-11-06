import { IUseSearchProps, IUseSearchRet } from '../core';
declare type SocketActions = 'POST' | 'PATCH' | 'DELETE';
export interface IUseSocketSearchProps<T extends object, B extends any[]> {
    namespace?: string;
    event: string;
    broadcast: (...event: B) => {
        _id: string;
        action: SocketActions;
        item: T;
    };
    filter: (...event: B) => boolean;
    idKey: keyof T;
}
export declare function useSocketSearch<T extends object, E, RES, B extends any[]>(path: string, props: IUseSearchProps<T, RES>, socketProps: IUseSocketSearchProps<T, B>): IUseSearchRet<T, E>;
export {};

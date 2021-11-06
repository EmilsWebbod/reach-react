import { ReachSocketConnection, SocketConnectionBroadcastFn, SocketConnectionFilterFn } from './SocketConnection';
export interface IUseSocketProps<T extends object, B extends any[]> {
    namespace: string | ((data: T) => string);
    event: string | ((data: T) => string);
    toData: (...data: B) => Partial<T>;
    filter: (data: T) => SocketConnectionFilterFn<B>;
}
export declare const userSocketPropsToParams: <T extends object, B extends any[]>(props: IUseSocketProps<T, B>, data: T) => [string, string];
export declare function useSocketNamespace<T extends any[]>(namespace?: string, event?: string, broadcast?: SocketConnectionBroadcastFn<T>, filter?: SocketConnectionFilterFn<T>): ReachSocketConnection<T> | null;

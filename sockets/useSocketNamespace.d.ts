import { ReachSocketConnection, SocketConnectionBroadcastFn, SocketConnectionFilterFn } from './SocketConnection';
export declare function useSocketNamespace<T extends any[]>(namespace?: string, event?: string, broadcast?: SocketConnectionBroadcastFn<T>, filter?: SocketConnectionFilterFn<T>): ReachSocketConnection<T> | null;

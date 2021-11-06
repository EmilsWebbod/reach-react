import { Socket, ManagerOptions, SocketOptions } from 'socket.io-client';
export declare type SocketConnectionBroadcastFn<T extends any[]> = (...broadcast: T) => void;
export declare type SocketConnectionFilterFn<T extends any[]> = (...data: T) => boolean;
export declare type SocketConnectionOpts = Partial<ManagerOptions & SocketOptions>;
export declare class ReachSocketConnection<T> {
    url: string;
    namespace: string;
    event: string;
    private socketConnection;
    private subscriptions;
    private disconnected;
    private timeouts;
    private maxTimeouts;
    private reconnect;
    constructor(url: string, namespace?: string, event?: string, opts?: SocketConnectionOpts);
    subscribe<O extends any[]>(callback: SocketConnectionBroadcastFn<O>, filter?: SocketConnectionFilterFn<O>): () => void;
    emit(event: string, ...args: any[]): void;
    on(event: string, fn: (...args: any[]) => void): Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
    disconnect(): void;
    private init;
}

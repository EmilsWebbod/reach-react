import * as React from 'react';
import { ReachSocketConnection } from './SocketConnection';
export declare const ReachNamespaceContext: React.Context<ReachSocketConnection<any> | null>;
export interface IReachNamespaceProviderProps<T extends any[]> extends JSX.ElementChildrenAttribute {
    namespace: string;
    broadcast: (event: string, ...data: T) => void;
}
export declare function ReachNamespaceProvider<T extends any[]>({ children, namespace, broadcast, }: IReachNamespaceProviderProps<T>): JSX.Element;

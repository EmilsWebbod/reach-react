import * as React from 'react';
import { MutableRefObject } from 'react';
import { ReachSocketConnection, SocketConnectionOpts } from './SocketConnection';
interface Props {
    url?: string;
    connections?: {
        namespace: string;
        event: string;
    }[];
    socketOpts?: SocketConnectionOpts;
}
interface ContextProps {
    connections: MutableRefObject<ReachSocketConnection<any>[]>;
    addConnection: <T extends object>(namespace?: string, event?: string) => ReachSocketConnection<T>;
    removeConnection: (namespace?: string) => void;
}
export declare const ReachSocketContext: React.Context<ContextProps>;
export declare function ReachSocketProvider<T>({ children, connections: defaultConnections, socketOpts, ...props }: Props & JSX.ElementChildrenAttribute): JSX.Element;
export {};

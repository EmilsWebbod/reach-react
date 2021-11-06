import * as React from 'react';
import { ReachSocketConnection, SocketConnectionBroadcastFn } from './SocketConnection';
import { ReachSocketContext } from './ReachSocketContext';

export const ReachNamespaceContext = React.createContext<ReachSocketConnection<any> | null>(null);

export interface IReachNamespaceProviderProps<T extends any[]> extends JSX.ElementChildrenAttribute {
  namespace: string;
  broadcast: SocketConnectionBroadcastFn<T>;
}

export function ReachNamespaceProvider<T extends any[]>({
  children,
  namespace,
  broadcast,
}: IReachNamespaceProviderProps<T>) {
  const [socket, setSocket] = React.useState<ReachSocketConnection<T> | null>(null);
  const { addConnection } = React.useContext(ReachSocketContext);

  React.useEffect(() => {
    const newSocket = addConnection(namespace);
    setSocket(newSocket);
    return newSocket.subscribe<T>(broadcast);
  }, [namespace, broadcast, addConnection, broadcast]);

  return <ReachNamespaceContext.Provider value={socket}>{children}</ReachNamespaceContext.Provider>;
}

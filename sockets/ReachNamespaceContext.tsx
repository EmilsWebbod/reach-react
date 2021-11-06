import * as React from 'react';
import { ReachSocketConnection } from './SocketConnection';
import { ReachSocketContext } from './ReachSocketContext';

export const ReachNamespaceContext = React.createContext<ReachSocketConnection<any> | null>(null);

export interface IReachNamespaceProviderProps<T extends any[]> extends JSX.ElementChildrenAttribute {
  namespace: string;
  broadcast: (event: string, ...data: T) => void;
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
  }, [namespace, broadcast, addConnection, broadcast]);

  return <ReachNamespaceContext.Provider value={socket}>{children}</ReachNamespaceContext.Provider>;
}

import { ReachSocketConnection, SocketConnectionBroadcastFn, SocketConnectionFilterFn } from './SocketConnection';
import { useContext, useEffect, useRef } from 'react';
import { ReachSocketContext } from './ReachSocketContext';

export function useSocketNamespace<T extends any[]>(
  namespace?: string,
  event?: string,
  broadcast?: SocketConnectionBroadcastFn<T>,
  filter?: SocketConnectionFilterFn<T>
) {
  const socket = useRef<ReachSocketConnection<T> | null>(null);
  const { addConnection, removeConnection } = useContext(ReachSocketContext);

  useEffect(() => {
    if (namespace && event) {
      socket.current = addConnection(namespace, event);
      if (typeof broadcast === 'function') {
        return socket.current.subscribe<T>(broadcast, filter);
      }
    }
  }, [namespace, event, addConnection, removeConnection, broadcast, filter]);

  return socket.current;
}

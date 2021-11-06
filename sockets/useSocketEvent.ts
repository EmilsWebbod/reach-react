import { useContext, useEffect, useRef } from 'react';
import { ReachSocketConnection } from './SocketConnection';
import { ReachSocketContext } from './ReachSocketContext';

export function useSocketEvent<T>(namespace?: string, event?: string, fn?: (...args: any[]) => void) {
  const socket = useRef<ReachSocketConnection<T> | null>(null);
  const { addConnection } = useContext(ReachSocketContext);

  useEffect(() => {
    if (event && fn) {
      socket.current = addConnection(namespace);
      const ret = socket.current.on(event, fn);
      return () => {
        ret.off(event, fn);
      };
    }
  }, [socket, namespace, event, fn, addConnection]);

  return socket;
}

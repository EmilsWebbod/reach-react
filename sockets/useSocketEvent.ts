import { useContext, useEffect } from 'react';
import { ReachSocketContext } from './ReachSocketContext';
import { ReachNamespaceContext } from './ReachNamespaceContext';

export function useSocketEvent<T>(event?: string, fn?: (...args: any[]) => void) {
  const socketConnection = useContext(ReachNamespaceContext);
  const { addConnection } = useContext(ReachSocketContext);

  useEffect(() => {
    if (socketConnection && event && fn) {
      const ret = socketConnection.on(event, fn);
      return () => {
        ret.off(event, fn);
      };
    }
  }, [socketConnection, event, fn, addConnection]);

  return socketConnection;
}

import { useContext, useEffect } from 'react';
import { ReachNamespaceContext } from './ReachNamespaceContext';

export function useSocketEvent(event?: string, fn?: (...args: any[]) => void) {
  const socketConnection = useContext(ReachNamespaceContext);

  useEffect(() => {
    if (socketConnection && event && fn) {
      const ret = socketConnection.on(event, fn);
      return () => {
        ret.off(event, fn);
      };
    }
  }, [socketConnection, event, fn]);

  return socketConnection;
}

import { useContext, useEffect, useRef } from 'react';
import { ReachSocketConnection, SocketConnectionBroadcastFn, SocketConnectionFilterFn } from './SocketConnection';
import { ReachSocketContext } from './ReachSocketContext';

export interface IUseSocketProps<T extends object, B extends any[]> {
  namespace: string | ((data: T) => string);
  event: string | ((data: T) => string);
  toData: (...data: B) => Partial<T>;
  filter: (data: T) => SocketConnectionFilterFn<B>;
}

export const userSocketPropsToParams = <T extends object, B extends any[]>(
  props: IUseSocketProps<T, B>,
  data: T
): [string, string] => [
  typeof props.namespace === 'function' ? props.namespace(data) : props.namespace,
  typeof props.event === 'function' ? props.event(data) : props.event,
];

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

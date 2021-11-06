import * as React from 'react';
import { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { ReachSocketConnection, SocketConnectionOpts } from './SocketConnection';
import { ReachContext } from '../core';

interface Props {
  url?: string;
  connections?: { namespace: string; event: string }[];
  socketOpts?: SocketConnectionOpts;
}

interface ContextProps {
  connections: MutableRefObject<ReachSocketConnection<any>[]>;
  addConnection: <T extends object>(namespace?: string, event?: string) => ReachSocketConnection<T>;
  removeConnection: (namespace?: string) => void;
}

const defaultState: ContextProps = {
  connections: { current: [] },
  addConnection: () => {
    return new ReachSocketConnection('', '');
  },
  removeConnection: () => {
    return new ReachSocketConnection('', '');
  },
};

export const ReachSocketContext = React.createContext<ContextProps>(defaultState);

export function ReachSocketProvider<T>({
  children,
  connections: defaultConnections = [],
  socketOpts = React.useMemo(() => ({}), []),
  ...props
}: Props & JSX.ElementChildrenAttribute) {
  const service = React.useContext(ReachContext);
  const connections = useRef<ReachSocketConnection<any>[]>([]);
  const url = props.url || service.url;

  if (!url) {
    throw new Error('ReachSocketProvider needs url. Provide in ReachProvider or Props');
  }

  useEffect(() => {
    for (const connection of defaultConnections) {
      if (!connections.current.some((x) => x.namespace !== connection.namespace)) {
        connections.current.push(
          new ReachSocketConnection<any>(url, connection.namespace, connection.event, socketOpts)
        );
      }
    }
  }, [url, defaultConnections, socketOpts]);

  const addConnection = useCallback(
    (namespace: string = '', event: string = '', opts: SocketConnectionOpts = socketOpts) => {
      let connection = connections.current.find((x) => x.namespace === namespace);

      if (!connection) {
        console.log('new connection', namespace, event);
        connection = new ReachSocketConnection<T>(url, namespace, event, opts);
        connections.current.push(connection);
      }

      return connection;
    },
    [connections, url, socketOpts]
  );

  const removeConnection = useCallback(
    (namespace: string = '') => {
      const index = connections.current.findIndex((x) => x.namespace === namespace);
      if (index > -1) {
        connections.current[index].disconnect();
        connections.current.splice(index, 1);
      }
    },
    [connections, url]
  );

  return (
    <ReachSocketContext.Provider value={{ connections, addConnection, removeConnection }}>
      {useMemo(() => children, [children])}
    </ReachSocketContext.Provider>
  );
}

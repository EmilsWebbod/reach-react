import { useContext, useMemo, useCallback } from 'react';
import { useSearch, IUseSearchProps, IUseSearchRet } from '../core';
import { useSocketNamespace } from './useSocketNamespace';
import { ReachNamespaceContext } from './ReachNamespaceContext';

type SocketActions = 'POST' | 'PATCH' | 'DELETE';

export interface IUseSocketSearchProps<T extends object, B extends any[]> {
  namespace?: string;
  event: string;
  broadcast: (...event: B) => { _id: string; action: SocketActions; item: T };
  filter: (...event: B) => boolean;
  idKey: keyof T;
}

export function useSocketSearch<T extends object, E, RES, B extends any[]>(
  path: string,
  props: IUseSearchProps<T, RES>,
  socketProps: IUseSocketSearchProps<T, B>
): IUseSearchRet<T, E> {
  const parentNamespace = useContext(ReachNamespaceContext);
  const [busy, items, error, next, info, actions] = useSearch<T, E, RES>(path, props);
  const namespace = socketProps.namespace || parentNamespace?.namespace;

  const broadcast = useCallback(
    (...events: B) => {
      try {
        const { _id, action, item } = socketProps.broadcast(...events);
        const idKey = socketProps.idKey;
        if (action === 'POST') {
          return actions.unshift(item);
        }
        const index = items.findIndex((x) => String(x[idKey]) === _id);
        if (index === -1) return;

        if (action === 'DELETE') {
          return actions.splice(index, 1);
        }

        return actions.splice(index, 1, { ...items[index], ...item });
      } catch (e) {
        console.error(e);
      }
    },
    [items, actions]
  );

  useSocketNamespace(namespace, socketProps.event, broadcast, socketProps.filter);

  return useMemo(() => [busy, items, error, next, info, actions], [busy, items, error, next, info, actions]);
}

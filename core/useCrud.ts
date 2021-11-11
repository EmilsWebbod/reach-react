import { ChangeEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IReachOptions, Reach } from '@ewb/reach';
import { ReachContext } from './ReachContext';

export interface IUseCrudProps<T extends object, RET = T> {
  idKey: keyof T;
  disableAutoSave?: boolean;
  initWithGet?: boolean;
  reachOptions?: Omit<IReachOptions, 'method' | 'data'>;
  dontSetStateOnPost?: boolean;
}

export interface IUseCrudState<T, E> {
  path: string;
  busy: boolean;
  data: Partial<T>;
  initialData: Partial<T>;
  edited: Edited<T>;
  error?: E;
}

type Edited<T> = {
  [key in keyof T]?: boolean;
};

export interface IUseCrudActions {
  read: () => void;
  delete: () => void;
}

type ValidEvents = HTMLInputElement | HTMLTextAreaElement;
export type IUseCrudSetFn<T extends object> = <K extends keyof T>(
  key: K,
  disableAutosave?: boolean
) => (event: ChangeEvent<ValidEvents> | T[K]) => void;
export type IUseCrudSaveFn<T> = () => Promise<T | null>;
export type IUseCrudSetDataFn<T extends object> = (data: Partial<T>) => void;
export type IUseCrudRet<T extends object, E, RET = T> = [
  state: IUseCrudState<T, E>,
  setField: IUseCrudSetFn<T>,
  save: IUseCrudSaveFn<RET>,
  set: IUseCrudSetDataFn<T>,
  actions: IUseCrudActions
];

export function useCrud<T extends object, E = any, RET = T>(
  path: string,
  data: Partial<T>,
  props: IUseCrudProps<T>
): IUseCrudRet<T, E, RET> {
  const service = useContext(ReachContext);
  const reach = useMemo(() => new Reach(service), [service]);
  const init = useRef(false);
  const initialData = useMemo(() => JSON.parse(JSON.stringify(data)), [data]);
  const defaultState = useMemo(() => getNewState(path, initialData), [path, props.idKey, initialData]);
  const ref = useRef<IUseCrudState<T, E>>(defaultState);
  const queue = useRef<IUseCrudState<T, E>[]>([]);
  const [state, setState] = useState<IUseCrudState<T, E>>(defaultState);
  const id = useMemo(() => state.data[props.idKey], [state.data, props.idKey]);
  const endpoint = useMemo(() => `${path}/${id}`, [path, id]);
  const opts = useMemo(() => props.reachOptions || {}, [props.reachOptions]);

  const fetch = useCallback(
    (method: 'GET' | 'DELETE') => async () => {
      try {
        const data = await reach.api<T>(endpoint, { method });
        ref.current = getNewState(endpoint, data);
        setState(ref.current);
      } catch (error) {
        setState((s) => ({ ...s, busy: false, error }));
      }
    },
    [reach, endpoint]
  );

  const patch = useCallback(
    async (state: IUseCrudState<T, E>): Promise<RET | null> => {
      try {
        if (!Object.values(state.edited).some(Boolean)) {
          return null;
        }

        if (ref.current.busy) {
          queue.current.push({ ...state });
          return null;
        }

        if (!ref.current.busy) {
          ref.current.busy = true;
          setState((s) => ({ ...s, busy: true }));
        }

        const id = state.data[props.idKey];
        let data: RET;
        if (id) {
          const body = getPatchData(state);
          data = await reach.api<RET>(`${path}/${id}`, { ...opts, method: 'PATCH', body });
        } else {
          data = await reach.api<RET>(path, { ...opts, method: 'POST', body: ref.current.data });
        }

        if (queue.current.length > 0) {
          const patchState = queue.current[0];
          queue.current.splice(0, 1);
          ref.current.busy = false;
          await patch(patchState);
        } else if (!props.dontSetStateOnPost) {
          ref.current = getNewState(path, data);
          setState(ref.current);
        }
        return data as RET;
      } catch (error) {
        setState((s) => ({ ...s, busy: false, error }));
        ref.current.busy = false;
        return null;
      }
    },
    [reach, path, props.idKey, opts, props.dontSetStateOnPost]
  );

  const set = useCallback(
    <K extends keyof T>(key: K, disableAutoSave = props.disableAutoSave) =>
      (event: ChangeEvent<ValidEvents> | T[K]) => {
        const value =
          event && typeof event === 'object' && 'target' in event ? (event.target.value as unknown as T[K]) : event;
        setState((s) => {
          ref.current = {
            ...s,
            edited: { ...s.edited, [key]: s.initialData[key] !== value },
            data: { ...s.data, [key]: value },
          };

          if (!disableAutoSave) {
            patch(ref.current);
          }

          return ref.current;
        });
      },
    [props.disableAutoSave, patch]
  );

  const save = useCallback(() => patch(ref.current), [patch]);

  const setData = useCallback((data: Partial<T>) => {
    setState((s) => getNewState(s.path, { ...s.data, ...data }, s.edited));
  }, []);

  const actions = useMemo(() => ({ read: fetch('GET'), delete: fetch('DELETE') }), [fetch]);

  useEffect(() => {
    if (!init.current && props.initWithGet && id) {
      init.current = true;
      actions.read();
    }
  }, [props.initWithGet, id, actions.read]);

  return [state, set, save, setData, actions];
}

function getPatchData<T extends object, E>(state: IUseCrudState<T, E>) {
  const patchData: Partial<T> = {};
  for (const key in state.edited) {
    if (state.edited[key]) {
      patchData[key] = state.data[key];
    }
  }
  return patchData;
}

function getNewState<T>(path: string, data: Partial<T>, edited: Edited<T> = {}) {
  return {
    path,
    busy: false,
    data,
    initialData: data,
    edited,
  };
}

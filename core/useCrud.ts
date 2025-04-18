import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IReachOptions, Reach } from '@ewb/reach';
import { ReachContext } from './ReachContext';

export interface IUseCrudProps<T extends object, RET = T> {
  idKey: keyof T;
  subPath?: string;
  disableAutoSave?: boolean;
  initWithGet?: boolean;
  reachOptions?: Omit<IReachOptions, 'method' | 'data'>;
  dontSetStateOnPost?: boolean;
  alwaysPatch?: boolean;
  alwaysPost?: boolean;
  forcePatch?: (keyof T)[];
}

type IUseCrudMeta<T extends object> = {
  [key in keyof T]?: any;
};

export interface IUseCrudState<T extends object, E> {
  path: string;
  busy: boolean;
  data: Partial<T>;
  initialData: Partial<T>;
  edited: Edited<T>;
  meta: IUseCrudMeta<T>;
  dirty: boolean;
  error?: E;
}

type Edited<T> = {
  [key in keyof T]?: boolean;
};

export interface IUseCrudActions {
  read: () => Promise<void>;
  delete: () => Promise<void>;
}

type ValidEvents = HTMLInputElement | HTMLTextAreaElement;
export type IUseCrudSetFn<T extends object> = <K extends keyof T>(
  key: K,
  disableAutosave?: boolean
) => (event: ChangeEvent<ValidEvents> | T[K], meta?: any) => void;
export type IUseCrudSaveFn<T> = () => Promise<T | null>;
export type IUseCrudSetDataFn<T extends object> = (
  data: Partial<T>,
  meta?: IUseCrudMeta<T>,
  isEdited?: boolean
) => void;
export type IUseCrudRet<T extends object, E, RET = T> = [
  IUseCrudState<T, E>,
  IUseCrudSetFn<T>,
  IUseCrudSaveFn<RET>,
  IUseCrudSetDataFn<T>,
  IUseCrudActions,
  Dispatch<SetStateAction<IUseCrudState<T, E>>>
] & {
  state: IUseCrudState<T, E>;
  set: IUseCrudSetFn<T>;
  save: IUseCrudSaveFn<RET>;
  setData: IUseCrudSetDataFn<T>;
  actions: IUseCrudActions;
  setState: Dispatch<SetStateAction<IUseCrudState<T, E>>>;
};

export function useCrud<T extends object, E = any, RET = T>(
  path: string,
  data: Partial<T>,
  props: IUseCrudProps<T>
): IUseCrudRet<T, E, RET> {
  const service = useContext(ReachContext);
  const reach = useMemo(() => new Reach(service), [service]);
  const init = useRef(false);
  const initialData = useMemo(() => JSON.parse(JSON.stringify(data)), [data]);
  const defaultState = useMemo(
    () => ({
      ...getNewState(path, initialData),
      dirty: !initialData[props.idKey],
      busy: Boolean(props.initWithGet && initialData[props.idKey]),
    }),
    [path, props.idKey, initialData]
  );
  const ref = useRef<IUseCrudState<T, E>>(defaultState);
  const queue = useRef<IUseCrudState<T, E>[]>([]);
  const [state, setState] = useState<IUseCrudState<T, E>>(defaultState);
  const id = useMemo(() => state.data[props.idKey], [state.data, props.idKey]);
  const opts = useMemo(() => props.reachOptions || {}, [props.reachOptions]);

  const fetch = useCallback(
    (method: 'GET' | 'DELETE') => async () => {
      try {
        if (!id) {
          console.warn('Fetch used when id is undefined');
          return;
        }
        const apiPath = `${path}/${id}`;
        const data = await reach.api<T>(apiPath, { ...opts, method });
        ref.current = getNewState(path, { ...ref.current.data, ...data });
        setState(ref.current);
      } catch (error) {
        ref.current.busy = false;
        ref.current.error = error;
        setState((s) => ({ ...s, busy: false, error }));
      }
    },
    [reach, opts, path, id]
  );

  const patch = useCallback(
    async (state: IUseCrudState<T, E>, key?: keyof T): Promise<RET | null> => {
      try {
        const id = state.data[props.idKey];
        if (id && !Object.values(state.edited).some(Boolean)) {
          return null;
        }

        if (ref.current.busy) {
          queue.current.push({ ...state });
          return ref.current.data as RET;
        }

        if (!ref.current.busy) {
          ref.current.busy = true;
          setState((s) => ({ ...s, busy: true }));
        }

        let data: RET | null;
        let apiPath = `${path}${id ? `/${id}` : ''}`;
        if (props.subPath) {
          apiPath += `/${props.subPath}`;
        }

        if (!props.alwaysPost && (id || props.alwaysPatch)) {
          const body = getPatchData(state, props.forcePatch, key);
          data = await reach.api<RET>(apiPath, { ...opts, method: 'PATCH', body });
        } else {
          data = await reach.api<RET>(apiPath, { ...opts, method: 'POST', body: ref.current.data });
        }

        if (queue.current.length > 0) {
          const patchState = queue.current[0];
          queue.current.splice(0, 1);
          ref.current.busy = false;
          await patch(patchState);
        } else if (!props.dontSetStateOnPost) {
          let edited: Edited<T> = {};
          if (key) {
            edited = ref.current.edited;
            edited[key] = false;
          }
          ref.current = getNewState(path, data || ref.current.data, edited, ref.current.meta);
          setState(ref.current);
        }
        return data as RET;
      } catch (error) {
        setState((s) => ({ ...s, busy: false, error }));
        ref.current.busy = false;
        ref.current.error = error;
        return null;
      }
    },
    [
      reach,
      path,
      props.idKey,
      props.subPath,
      opts,
      props.dontSetStateOnPost,
      props.alwaysPatch,
      props.alwaysPost,
      props.forcePatch,
    ]
  );

  const set = useCallback(
    <K extends keyof T>(key: K, disableAutoSave = props.disableAutoSave) =>
      (event: ChangeEvent<ValidEvents> | T[K], meta?: any) => {
        const value =
          event && typeof event === 'object' && 'target' in event ? (event.target.value as unknown as T[K]) : event;
        setState((s) => {
          const edited = { ...s.edited, [key]: !s.initialData[key] || s.initialData[key] !== value };
          ref.current = {
            ...s,
            edited,
            dirty: Object.values(edited).some(Boolean),
            data: { ...s.data, [key]: value },
          };

          if (meta) {
            ref.current.meta[key] = meta;
          }

          if (!disableAutoSave) {
            patch(ref.current, key);
          }

          return ref.current;
        });
      },
    [props.disableAutoSave, patch]
  );

  const save = useCallback(() => patch(ref.current), [patch]);

  const setData = useCallback((data: Partial<T>, meta: IUseCrudMeta<T> = {}, isEdited = true) => {
    setState((s) => {
      const edited = { ...s.edited };
      // @ts-ignore
      Object.keys(data).forEach((key: keyof T) => {
        if (s.data[key] !== data[key]) {
          edited[key] = isEdited;
        }
      });
      ref.current = getNewState(s.path, { ...s.data, ...data }, edited, { ...s.meta, ...meta });
      return ref.current;
    });
  }, []);

  const actions = useMemo(() => ({ read: fetch('GET'), delete: fetch('DELETE') }), [fetch]);

  useEffect(() => {
    if (!init.current && props.initWithGet && id) {
      actions.read();
    }
    init.current = true;
  }, [props.initWithGet, id, actions.read]);

  return useMemo((): IUseCrudRet<T, E, RET> => {
    const ret = [state, set, save, setData, actions, setState] as IUseCrudRet<T, E, RET>;
    ret.state = state;
    ret.set = set;
    ret.save = save;
    ret.setData = setData;
    ret.actions = actions;
    ret.setState = setState;
    return ret;
  }, [state, set, save, setData, actions, setState]);
}

function getPatchData<T extends object, E>(state: IUseCrudState<T, E>, forcePatch?: (keyof T)[], key?: keyof T) {
  if (key) {
    return {
      [key]: state.data[key],
    };
  }
  const patchData: Partial<T> = {};
  for (const key in state.edited) {
    if (state.edited[key]) {
      patchData[key] = state.data[key];
    }
  }
  if (forcePatch) {
    for (const key of forcePatch) {
      patchData[key] = state.data[key];
    }
  }
  return patchData;
}

function getNewState<T extends object>(
  path: string,
  data: Partial<T>,
  edited: Edited<T> = {},
  meta: IUseCrudMeta<T> = {}
) {
  return {
    path,
    busy: false,
    dirty: Object.values(edited).some(Boolean),
    data,
    initialData: data,
    edited,
    meta,
  };
}

import { ChangeEvent, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Reach } from '@ewb/reach';
import { ReachContext } from './ReachContext';

export interface IUseCrudProps<T extends object> {
  idKey: keyof T;
  disableAutoSave?: boolean;
}

export interface IUseCrudState<T, E> {
  busy: boolean;
  data: Partial<T>;
  initialData: Partial<T>;
  edited: Edited<T>;
  error?: E;
}

type Edited<T> = {
  [key in keyof T]?: boolean;
};

type ValidEvents = HTMLInputElement | HTMLTextAreaElement;
export type IUseCrudSetFn<T extends object> = <K extends keyof T>(
  key: K
) => (event: ChangeEvent<ValidEvents> | T[K]) => void;
export type IUseCrudSaveFn = () => Promise<void>;
export type IUseCrudSetDataFn<T extends object> = (data: Partial<T>) => void;
export type IUseCrudRet<T extends object, E> = [
  IUseCrudState<T, E>,
  IUseCrudSetFn<T>,
  IUseCrudSaveFn,
  IUseCrudSetDataFn<T>
];

export function useCrud<T extends object, E = any>(
  path: string,
  data: Partial<T>,
  props: IUseCrudProps<T>
): IUseCrudRet<T, E> {
  const service = useContext(ReachContext);
  const reach = useMemo(() => new Reach(service), [service]);
  const initialData = useMemo(() => JSON.parse(JSON.stringify(data)), [data]);
  const defaultState = useMemo(() => getNewState(initialData), [initialData]);
  const ref = useRef<IUseCrudState<T, E>>(defaultState);
  const queue = useRef<IUseCrudState<T, E>[]>([]);
  const [state, setState] = useState<IUseCrudState<T, E>>(defaultState);

  const patch = useCallback(
    async (state: IUseCrudState<T, E>) => {
      try {
        if (!Object.values(state.edited).some(Boolean)) {
          return;
        }

        if (ref.current.busy) {
          queue.current.push({ ...state });
          return;
        }

        if (!ref.current.busy) {
          ref.current.busy = true;
          setState((s) => ({ ...s, busy: true }));
        }

        const id = state.data[props.idKey];
        let data;
        if (id) {
          const body = getPatchData(state);
          data = await reach.api(`${path}/${id}`, { method: 'PATCH', body });
        } else {
          data = await reach.api(path, { method: 'POST', body: ref.current.data });
        }

        if (queue.current.length > 0) {
          const patchState = queue.current[0];
          queue.current.splice(0, 1);
          ref.current.busy = false;
          await patch(patchState);
        } else {
          ref.current = getNewState(data);
          setState(ref.current);
        }
      } catch (error) {
        setState((s) => ({ ...s, busy: false, error }));
        ref.current.busy = false;
      }
    },
    [reach, props.idKey]
  );

  const set = useCallback(
    <K extends keyof T>(key: K) =>
      (event: ChangeEvent<ValidEvents> | T[K], disableAutoSave = props.disableAutoSave) => {
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
    setState((s) => getNewState({ ...s.data, ...data }));
  }, []);

  return [state, set, save, setData];
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

function getNewState<T>(data: Partial<T>) {
  return {
    busy: false,
    data,
    initialData: data,
    edited: {},
  };
}

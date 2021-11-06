import { ChangeEvent } from 'react';
export interface IUseCrudProps<T extends object> {
    idKey: keyof T;
    disableAutoSave?: boolean;
    initWithGet?: boolean;
}
export interface IUseCrudState<T, E> {
    endpoint: string;
    busy: boolean;
    data: Partial<T>;
    initialData: Partial<T>;
    edited: Edited<T>;
    error?: E;
}
declare type Edited<T> = {
    [key in keyof T]?: boolean;
};
export interface IUseCrudActions {
    read: () => void;
    delete: () => void;
}
declare type ValidEvents = HTMLInputElement | HTMLTextAreaElement;
export declare type IUseCrudSetFn<T extends object> = <K extends keyof T>(key: K, disableAutosave?: boolean) => (event: ChangeEvent<ValidEvents> | T[K]) => void;
export declare type IUseCrudSaveFn = () => Promise<void>;
export declare type IUseCrudSetDataFn<T extends object> = (data: Partial<T>) => void;
export declare type IUseCrudRet<T extends object, E> = [
    state: IUseCrudState<T, E>,
    setField: IUseCrudSetFn<T>,
    save: IUseCrudSaveFn,
    set: IUseCrudSetDataFn<T>,
    actions: IUseCrudActions
];
export declare function useCrud<T extends object, E = any>(path: string, data: Partial<T>, props: IUseCrudProps<T>): IUseCrudRet<T, E>;
export {};

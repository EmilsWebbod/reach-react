import { ChangeEvent } from 'react';
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
declare type Edited<T> = {
    [key in keyof T]?: boolean;
};
declare type ValidEvents = HTMLInputElement | HTMLTextAreaElement;
export declare type IUseCrudSetFn<T extends object> = <K extends keyof T>(key: K) => (event: ChangeEvent<ValidEvents> | T[K]) => void;
export declare type IUseCrudSaveFn = () => Promise<void>;
export declare type IUseCrudRet<T extends object, E> = [IUseCrudState<T, E>, IUseCrudSetFn<T>, IUseCrudSaveFn];
export declare function useCrud<T extends object, E = any>(path: string, data: Partial<T>, props: IUseCrudProps<T>): IUseCrudRet<T, E>;
export {};

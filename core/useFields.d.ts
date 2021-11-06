import { IUseCrudProps, IUseCrudSaveFn, IUseCrudSetDataFn, IUseCrudSetFn, IUseCrudState } from './useCrud';
export declare type IUseFieldEdit<T extends object, P extends {}> = {
    [K in keyof T]?: IUseFieldValueIn<T, K> & P;
};
export interface IUseFieldState<T extends {}, E> extends Omit<IUseCrudState<T, E>, 'data'> {
    data: T;
}
export declare type IUseFieldValueIn<T extends object, K extends keyof T> = {
    defaultValue: T[K];
};
export interface IUseFieldValueRet<T extends object, K extends keyof T> extends IUseFieldValueIn<T, K> {
    id: string;
    edited: boolean;
    value: T[K];
}
export declare type IUseFieldRet<T extends object, E, P extends {}> = {
    state: IUseFieldState<T, E>;
    getField: <K extends keyof T>(key: K) => IUseFieldValueRet<T, K> & P;
    setField: IUseCrudSetFn<T>;
    save: IUseCrudSaveFn;
    setData: IUseCrudSetDataFn<T>;
};
export declare function useFields<T extends object, E, P extends {}>(path: string, data: Partial<T>, fields: IUseFieldEdit<T, P>, props: IUseCrudProps<T>): IUseFieldRet<T, E, P>;

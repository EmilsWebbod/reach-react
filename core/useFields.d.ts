import { IUseCrudProps, IUseCrudSaveFn, IUseCrudSetDataFn, IUseCrudSetFn, IUseCrudState } from './useCrud';
export declare type IUseFieldEdit<T extends object, P extends object> = {
    [K in keyof T]?: {
        defaultValue: T[K];
    } & P;
};
export interface IUseFieldState<T extends object, E> extends Omit<IUseCrudState<T, E>, 'data'> {
    data: T;
}
export declare type IUseFieldValueRet<T extends object, K extends keyof T, P extends object> = {
    defaultValue: T[K];
    value: T[K];
} & P;
export declare type IUseFieldRet<T extends object, P extends object, E> = [
    IUseFieldState<T, E>,
    <K extends keyof T>(key: K) => IUseFieldValueRet<T, K, P>,
    IUseCrudSetFn<T>,
    IUseCrudSaveFn,
    IUseCrudSetDataFn<T>
];
export declare function useFields<T extends object, P extends object, E = any>(path: string, data: Partial<T>, fields: IUseFieldEdit<T, P>, props: IUseCrudProps<T>): IUseFieldRet<T, P, E>;

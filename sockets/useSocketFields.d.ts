import { IUseCrudProps, IUseFieldEdit, IUseFieldRet } from '../core';
import { SocketConnectionFilterFn } from './SocketConnection';
interface FieldsProps<T extends object, P extends object> {
    fields: IUseFieldEdit<T, P>;
    props: IUseCrudProps<T>;
}
interface SocketProps<T extends object, B extends any[]> {
    namespace: string | ((data: T) => string);
    event: string;
    toData: (...data: B) => Partial<T>;
    filter: SocketConnectionFilterFn<B>;
}
export declare function useSocketFields<T extends object, P extends object, E = any>(path: string, data: Partial<T>, fields: FieldsProps<T, P>, socketProps: SocketProps<T, any[]>): IUseFieldRet<T, P, E>;
export {};

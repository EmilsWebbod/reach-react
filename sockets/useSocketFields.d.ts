import { IUseCrudProps, IUseFieldEdit, IUseFieldRet } from '../core';
import { IUseSocketProps } from './useSocketNamespace';
interface FieldsProps<T extends object, P extends object> {
    fields: IUseFieldEdit<T, P>;
    props: IUseCrudProps<T>;
}
export declare function useSocketFields<T extends object, P extends object, E = any>(path: string, data: Partial<T>, fields: FieldsProps<T, P>, socketProps: IUseSocketProps<T, any[]>): IUseFieldRet<T, P, E>;
export {};

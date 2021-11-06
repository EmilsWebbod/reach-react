import { IUseCrudProps, IUseFieldEdit, IUseFieldRet } from '../core';
import { IUseSocketProps } from './useSocketNamespace';
export interface IUseSocketFieldssProps<T extends object, P extends object> {
    fields: IUseFieldEdit<T, P>;
    props: IUseCrudProps<T>;
}
export declare function useSocketFields<T extends object, E, P extends {}, B extends any[]>(path: string, data: Partial<T>, fields: IUseSocketFieldssProps<T, P>, socketProps: IUseSocketProps<T, B>): IUseFieldRet<T, E, P>;

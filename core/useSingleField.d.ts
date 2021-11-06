declare type IUserSingleFieldRet<T extends object, K extends Path<T> & string, V extends PathValue<T, Path<T>>, E> = [
    busy: boolean,
    state: V,
    error: E | undefined,
    setValue: (value: V) => void,
    save: () => void
];
export declare function useSingleField<T extends object, K extends Path<T> & string, V extends PathValue<T, K>, E>(path: string, data: T, key: K): IUserSingleFieldRet<T, K, V, E>;
export declare type PathImpl<T, K extends keyof T> = K extends string ? T[K] extends Record<string, any> ? T[K] extends ArrayLike<any> ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}` : K | `${K}.${PathImpl<T[K], keyof T[K]>}` : K : never;
export declare type Path<T> = PathImpl<T, keyof T> | keyof T;
export declare type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}` ? K extends keyof T ? Rest extends Path<T[K]> ? PathValue<T[K], Rest> : never : never : P extends keyof T ? T[P] : never;
export {};

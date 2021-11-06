/// <reference types="react" />
import { ReachSocketConnection } from './SocketConnection';
export declare function useSocketEvent<T>(namespace?: string, event?: string, fn?: (...args: any[]) => void): import("react").MutableRefObject<ReachSocketConnection<T> | null>;

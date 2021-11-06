import { io, Socket, ManagerOptions, SocketOptions } from 'socket.io-client';
import { v4 } from 'uuid';

export type SocketConnectionBroadcastFn<T extends any[]> = (...broadcast: T) => void;
export type SocketConnectionFilterFn<T extends any[]> = (...data: T) => boolean;
export type SocketConnectionOpts = Partial<ManagerOptions & SocketOptions>;

interface Subscription<T extends any[]> {
  _id: string;
  filter?: SocketConnectionFilterFn<T>;
  callback: SocketConnectionBroadcastFn<T>;
}

export class ReachSocketConnection<T> {
  private socketConnection: Socket;
  private subscriptions: Array<Subscription<any>> = [];
  private disconnected = false;
  private timeouts = 0;
  private maxTimeouts = 5;
  private reconnect = 5000;

  constructor(
    public url: string,
    public namespace: string = '',
    public event: string = '',
    opts: SocketConnectionOpts = {}
  ) {
    this.socketConnection = io(`${this.url}${namespace ? `/${namespace}` : ''}`, {
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
      reconnectionDelayMax: 10000,
      autoConnect: true,
      withCredentials: true,
      ...opts,
    });
    this.init();
  }

  public subscribe<O extends any[]>(callback: SocketConnectionBroadcastFn<O>, filter?: SocketConnectionFilterFn<O>) {
    const _id = v4();
    this.subscriptions.push({
      _id,
      callback,
      filter,
    });
    return unsubscribe(this.subscriptions, _id);
  }

  public emit(event: string, ...args: any[]) {
    this.socketConnection.emit(event, args);
  }

  public on(event: string, fn: (...args: any[]) => void) {
    return this.socketConnection.on(event, fn);
  }

  public disconnect() {
    this.disconnected = true;
    this.subscriptions = [];
    this.socketConnection.disconnect();
    this.socketConnection.close();
  }

  private init() {
    this.socketConnection.on('connect', () => {});
    this.socketConnection.once('connect', () => {
      this.socketConnection.on(this.event, (...broadcast: T[]) => {
        this.subscriptions.forEach((x) =>
          x.filter ? x.filter(...broadcast) && x.callback(...broadcast) : x.callback(...broadcast)
        );
      });
    });

    this.socketConnection.on('error', (e: any) => {
      console.warn('SocketConnection error', this.namespace, e);
      if (Number(e) >= 400) {
        console.warn('SocketConnection disconnected');
        return this.disconnect();
      }
      if (this.socketConnection.disconnected && this.timeouts <= this.maxTimeouts) {
        console.warn(`SocketConnection lost connection. Reconnecting in ${this.reconnect / 1000}s`);
        this.timeouts++;
        setTimeout(() => this.socketConnection.connect(), this.reconnect);
      }
    });
  }
}

function unsubscribe(subscriptions: Array<Subscription<any>>, _id: string) {
  return () => {
    const index = subscriptions.findIndex((x) => x._id === _id);
    subscriptions.splice(index, 1);
  };
}

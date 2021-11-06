"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReachSocketConnection = void 0;
const socket_io_client_1 = require("socket.io-client");
const uuid_1 = require("uuid");
class ReachSocketConnection {
    constructor(url, namespace = '', event = '', opts = {}) {
        this.url = url;
        this.namespace = namespace;
        this.event = event;
        this.subscriptions = [];
        this.disconnected = false;
        this.timeouts = 0;
        this.maxTimeouts = 5;
        this.reconnect = 5000;
        this.socketConnection = socket_io_client_1.io(`${this.url}${namespace ? `/${namespace}` : ''}`, Object.assign({ reconnection: true, reconnectionDelay: 2000, reconnectionAttempts: 10, reconnectionDelayMax: 10000, autoConnect: true, withCredentials: true }, opts));
        this.init();
    }
    subscribe(callback, filter) {
        const _id = uuid_1.v4();
        this.subscriptions.push({
            _id,
            callback,
            filter,
        });
        return unsubscribe(this.subscriptions, _id);
    }
    emit(event, ...args) {
        this.socketConnection.emit(event, args);
    }
    on(event, fn) {
        return this.socketConnection.on(event, fn);
    }
    disconnect() {
        this.disconnected = true;
        this.subscriptions = [];
        this.socketConnection.disconnect();
        this.socketConnection.close();
    }
    init() {
        this.socketConnection.on('connect', () => { });
        this.socketConnection.once('connect', () => {
            this.socketConnection.on(this.event, (...broadcast) => {
                this.subscriptions.forEach((x) => x.filter ? x.filter(...broadcast) && x.callback(...broadcast) : x.callback(...broadcast));
            });
        });
        this.socketConnection.on('error', (e) => {
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
exports.ReachSocketConnection = ReachSocketConnection;
function unsubscribe(subscriptions, _id) {
    return () => {
        const index = subscriptions.findIndex((x) => x._id === _id);
        subscriptions.splice(index, 1);
    };
}

"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReachSocketProvider = exports.ReachSocketContext = void 0;
const React = require("react");
const react_1 = require("react");
const SocketConnection_1 = require("./SocketConnection");
const core_1 = require("../core");
const defaultState = {
    connections: { current: [] },
    addConnection: () => {
        return new SocketConnection_1.ReachSocketConnection('', '');
    },
    removeConnection: () => {
        return new SocketConnection_1.ReachSocketConnection('', '');
    },
};
exports.ReachSocketContext = React.createContext(defaultState);
function ReachSocketProvider(_a) {
    var { children, connections: defaultConnections = [], socketOpts = React.useMemo(() => ({}), []) } = _a, props = __rest(_a, ["children", "connections", "socketOpts"]);
    const service = React.useContext(core_1.ReachContext);
    const connections = react_1.useRef([]);
    const url = props.url || service.url;
    if (!url) {
        throw new Error('ReachSocketProvider needs url. Provide in ReachProvider or Props');
    }
    react_1.useEffect(() => {
        for (const connection of defaultConnections) {
            if (!connections.current.some((x) => x.namespace !== connection.namespace)) {
                connections.current.push(new SocketConnection_1.ReachSocketConnection(url, connection.namespace, connection.event, socketOpts));
            }
        }
    }, [url, defaultConnections, socketOpts]);
    const addConnection = react_1.useCallback((namespace = '', event = '', opts = socketOpts) => {
        let connection = connections.current.find((x) => x.namespace === namespace);
        if (!connection) {
            console.log('new connection', namespace, event);
            connection = new SocketConnection_1.ReachSocketConnection(url, namespace, event, opts);
            connections.current.push(connection);
        }
        return connection;
    }, [connections, url, socketOpts]);
    const removeConnection = react_1.useCallback((namespace = '') => {
        const index = connections.current.findIndex((x) => x.namespace === namespace);
        if (index > -1) {
            connections.current[index].disconnect();
            connections.current.splice(index, 1);
        }
    }, [connections, url]);
    return (React.createElement(exports.ReachSocketContext.Provider, { value: { connections, addConnection, removeConnection } }, react_1.useMemo(() => children, [children])));
}
exports.ReachSocketProvider = ReachSocketProvider;

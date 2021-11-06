"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocketNamespace = exports.userSocketPropsToParams = void 0;
const react_1 = require("react");
const ReachSocketContext_1 = require("./ReachSocketContext");
const userSocketPropsToParams = (props, data) => [
    typeof props.namespace === 'function' ? props.namespace(data) : props.namespace,
    typeof props.event === 'function' ? props.event(data) : props.event,
];
exports.userSocketPropsToParams = userSocketPropsToParams;
function useSocketNamespace(namespace, event, broadcast, filter) {
    const socket = react_1.useRef(null);
    const { addConnection, removeConnection } = react_1.useContext(ReachSocketContext_1.ReachSocketContext);
    react_1.useEffect(() => {
        if (namespace && event) {
            socket.current = addConnection(namespace, event);
            if (typeof broadcast === 'function') {
                return socket.current.subscribe(broadcast, filter);
            }
        }
    }, [namespace, event, addConnection, removeConnection, broadcast, filter]);
    return socket.current;
}
exports.useSocketNamespace = useSocketNamespace;

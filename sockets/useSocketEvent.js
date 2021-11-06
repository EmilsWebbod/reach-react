"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocketEvent = void 0;
const react_1 = require("react");
const ReachSocketContext_1 = require("./ReachSocketContext");
function useSocketEvent(namespace, event, fn) {
    const socket = react_1.useRef(null);
    const { addConnection } = react_1.useContext(ReachSocketContext_1.ReachSocketContext);
    react_1.useEffect(() => {
        if (event && fn) {
            socket.current = addConnection(namespace);
            const ret = socket.current.on(event, fn);
            return () => {
                ret.off(event, fn);
            };
        }
    }, [socket, namespace, event, fn, addConnection]);
    return socket;
}
exports.useSocketEvent = useSocketEvent;

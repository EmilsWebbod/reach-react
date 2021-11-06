"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocketEvent = void 0;
const react_1 = require("react");
const ReachSocketContext_1 = require("./ReachSocketContext");
const ReachNamespaceContext_1 = require("./ReachNamespaceContext");
function useSocketEvent(event, fn) {
    const socketConnection = react_1.useContext(ReachNamespaceContext_1.ReachNamespaceContext);
    const { addConnection } = react_1.useContext(ReachSocketContext_1.ReachSocketContext);
    react_1.useEffect(() => {
        if (socketConnection && event && fn) {
            const ret = socketConnection.on(event, fn);
            return () => {
                ret.off(event, fn);
            };
        }
    }, [socketConnection, event, fn, addConnection]);
    return socketConnection;
}
exports.useSocketEvent = useSocketEvent;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReachNamespaceProvider = exports.ReachNamespaceContext = void 0;
const React = require("react");
const ReachSocketContext_1 = require("./ReachSocketContext");
exports.ReachNamespaceContext = React.createContext(null);
function ReachNamespaceProvider({ children, namespace, broadcast, }) {
    const [socket, setSocket] = React.useState(null);
    const { addConnection } = React.useContext(ReachSocketContext_1.ReachSocketContext);
    React.useEffect(() => {
        const newSocket = addConnection(namespace);
        setSocket(newSocket);
    }, [namespace, broadcast, addConnection, broadcast]);
    return React.createElement(exports.ReachNamespaceContext.Provider, { value: socket }, children);
}
exports.ReachNamespaceProvider = ReachNamespaceProvider;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocketSearch = void 0;
const react_1 = require("react");
const core_1 = require("../core");
const useSocketNamespace_1 = require("./useSocketNamespace");
const ReachNamespaceContext_1 = require("./ReachNamespaceContext");
function useSocketSearch(path, props, socketProps) {
    const parentNamespace = react_1.useContext(ReachNamespaceContext_1.ReachNamespaceContext);
    const [busy, items, error, next, info, actions] = core_1.useSearch(path, props);
    const namespace = socketProps.namespace || (parentNamespace === null || parentNamespace === void 0 ? void 0 : parentNamespace.namespace);
    const broadcast = react_1.useCallback((...events) => {
        try {
            const { _id, action, item } = socketProps.broadcast(...events);
            const idKey = socketProps.idKey;
            if (action === 'POST') {
                return actions.unshift(item);
            }
            console.log(idKey, _id, items);
            const index = items.findIndex((x) => String(x[idKey]) === _id);
            console.log(action, index, item);
            if (index === -1)
                return;
            if (action === 'DELETE') {
                return actions.splice(index, 1);
            }
            return actions.splice(index, 1, Object.assign(Object.assign({}, items[index]), item));
        }
        catch (e) {
            console.error(e);
        }
    }, [items, actions]);
    useSocketNamespace_1.useSocketNamespace(namespace, socketProps.event, broadcast, socketProps.filter);
    return react_1.useMemo(() => [busy, items, error, next, info, actions], [busy, items, error, next, info, actions]);
}
exports.useSocketSearch = useSocketSearch;

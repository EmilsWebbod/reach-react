"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocketFields = void 0;
const core_1 = require("../core");
const react_1 = require("react");
const useSocketNamespace_1 = require("./useSocketNamespace");
function useSocketFields(path, data, fields, socketProps) {
    const [state, getField, set, save, setData] = core_1.useFields(path, data, fields.fields, fields.props);
    useSocketNamespace_1.useSocketNamespace(typeof socketProps.namespace === 'function' ? socketProps.namespace(state.data) : socketProps.namespace, socketProps.event, (...event) => setData(socketProps.toData(...event)), socketProps.filter);
    return react_1.useMemo(() => [state, getField, set, save, setData], [state, getField, set, save, setData]);
}
exports.useSocketFields = useSocketFields;
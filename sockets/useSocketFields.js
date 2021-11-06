"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocketFields = void 0;
const core_1 = require("../core");
const useSocketNamespace_1 = require("./useSocketNamespace");
function useSocketFields(path, data, fields, socketProps) {
    const field = core_1.useFields(path, data, fields.fields, fields.props);
    useSocketNamespace_1.useSocketNamespace(...useSocketNamespace_1.userSocketPropsToParams(socketProps, field.state.data), (...events) => {
        const data = socketProps.toData(...events);
        field.setData(data);
    }, socketProps.filter(field.state.data));
    return field;
}
exports.useSocketFields = useSocketFields;

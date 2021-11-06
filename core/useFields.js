"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFields = void 0;
const react_1 = require("react");
const useCrud_1 = require("./useCrud");
function useFields(path, data, fields, props) {
    const defaultData = react_1.useMemo(() => {
        const newData = {};
        for (const key in data) {
            newData[key] = data[key];
        }
        for (const key in fields) {
            if (!newData[key] && fields[key]) {
                newData[key] = fields[key].defaultValue;
            }
        }
        return newData;
    }, [fields, data]);
    const [state, set, save, setData] = useCrud_1.useCrud(path, defaultData, Object.assign({ disableAutoSave: false }, props));
    const getField = react_1.useCallback((key) => {
        if (!fields[key]) {
            throw new Error(`useField was used with edit field that was not defined. Add ${key} to field object`);
        }
        return Object.assign(Object.assign({}, fields[key]), { value: state.data[key] });
    }, [state, fields]);
    return react_1.useMemo(() => [state, getField, set, save, setData], [state, getField, set, save, setData]);
}
exports.useFields = useFields;

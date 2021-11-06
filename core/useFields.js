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
    const [state, setField, save, setData] = useCrud_1.useCrud(path, defaultData, Object.assign({ disableAutoSave: false }, props));
    const getField = react_1.useCallback((key) => {
        if (!fields[key]) {
            throw new Error(`useField was used with edit field that was not defined. Add ${key} to field object`);
        }
        const id = `${state.data[props.idKey]}-${key}`;
        const edited = Boolean(state.edited[key]);
        return Object.assign(Object.assign({}, fields[key]), { id, edited, value: state.data[key] });
    }, [state, props.idKey, fields]);
    return react_1.useMemo(() => ({ state: state, getField, setField, save, setData }), [state, getField, setField, save, setData]);
}
exports.useFields = useFields;

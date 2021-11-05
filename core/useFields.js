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
    const [state, set, save] = useCrud_1.useCrud(path, defaultData, Object.assign({ disableAutoSave: false }, props));
    const getField = react_1.useCallback((key) => {
        if (!fields[key]) {
            throw new Error(`useField was used with edit field that was not defined. Add ${key} to field object`);
        }
        const _a = fields[key], { defaultValue } = _a, rest = __rest(_a, ["defaultValue"]);
        return Object.assign(Object.assign({}, rest), { value: state.data[key] });
    }, [state, fields]);
    return [state, getField, set, save];
}
exports.useFields = useFields;

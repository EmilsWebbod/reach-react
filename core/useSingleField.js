"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSingleField = void 0;
const react_1 = require("react");
const reach_1 = require("@ewb/reach");
const ReachContext_1 = require("./ReachContext");
function useSingleField(path, data, key) {
    const value = react_1.useMemo(() => getValue(data, key.split('.')), [data, key]);
    const ref = react_1.useRef(value);
    const service = react_1.useContext(ReachContext_1.ReachContext);
    const reach = react_1.useMemo(() => new reach_1.Reach(service), [service]);
    const [state, setState] = react_1.useState({
        value: ref.current,
        busy: false,
    });
    const save = react_1.useCallback(() => __awaiter(this, void 0, void 0, function* () {
        try {
            setState((s) => (Object.assign(Object.assign({}, s), { busy: true })));
            yield reach.api(path, { method: 'PATCH', body: { [key]: ref.current } });
            setState((s) => (Object.assign(Object.assign({}, s), { busy: false, value: ref.current })));
        }
        catch (error) {
            setState((s) => (Object.assign(Object.assign({}, s), { busy: false, error })));
        }
    }), [path, reach, key]);
    const setValue = react_1.useCallback((value) => {
        ref.current = value;
        setState((s) => (Object.assign(Object.assign({}, s), { value })));
    }, []);
    react_1.useEffect(() => {
        if (value !== ref.current) {
            ref.current = value;
            setState((s) => (Object.assign(Object.assign({}, s), { value })));
        }
    }, [value]);
    return [state.busy, state.value, state.error, setValue, save];
}
exports.useSingleField = useSingleField;
function getValue(data, arr) {
    const key = arr[0];
    if (key && data[key]) {
        if (typeof data[key] === 'object')
            return getValue(data[key], arr.slice(1));
    }
    return data[key];
}

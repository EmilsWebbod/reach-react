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
exports.useCrud = void 0;
const react_1 = require("react");
const reach_1 = require("@ewb/reach");
const ReachContext_1 = require("./ReachContext");
function useCrud(path, data, props) {
    const service = react_1.useContext(ReachContext_1.ReachContext);
    const reach = react_1.useMemo(() => new reach_1.Reach(service), [service]);
    const init = react_1.useRef(false);
    const initialData = react_1.useMemo(() => JSON.parse(JSON.stringify(data)), [data]);
    const defaultState = react_1.useMemo(() => getNewState(initialData), [initialData]);
    const ref = react_1.useRef(defaultState);
    const queue = react_1.useRef([]);
    const [state, setState] = react_1.useState(defaultState);
    const id = react_1.useMemo(() => state.data[props.idKey], [state.data, props.idKey]);
    const endpoint = react_1.useMemo(() => `${path}/${id}`, [path, id]);
    const fetch = react_1.useCallback((method) => () => __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield reach.api(endpoint, { method });
            ref.current = getNewState(data);
            setState(ref.current);
        }
        catch (error) {
            setState((s) => (Object.assign(Object.assign({}, s), { busy: false, error })));
        }
    }), [reach, endpoint]);
    const patch = react_1.useCallback((state) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!Object.values(state.edited).some(Boolean)) {
                return;
            }
            if (ref.current.busy) {
                queue.current.push(Object.assign({}, state));
                return;
            }
            if (!ref.current.busy) {
                ref.current.busy = true;
                setState((s) => (Object.assign(Object.assign({}, s), { busy: true })));
            }
            const id = state.data[props.idKey];
            let data;
            if (id) {
                const body = getPatchData(state);
                data = yield reach.api(`${path}/${id}`, { method: 'PATCH', body });
            }
            else {
                data = yield reach.api(path, { method: 'POST', body: ref.current.data });
            }
            if (queue.current.length > 0) {
                const patchState = queue.current[0];
                queue.current.splice(0, 1);
                ref.current.busy = false;
                yield patch(patchState);
            }
            else {
                ref.current = getNewState(data);
                setState(ref.current);
            }
        }
        catch (error) {
            setState((s) => (Object.assign(Object.assign({}, s), { busy: false, error })));
            ref.current.busy = false;
        }
    }), [reach, props.idKey]);
    const set = react_1.useCallback((key, disableAutoSave = props.disableAutoSave) => (event) => {
        const value = event && typeof event === 'object' && 'target' in event ? event.target.value : event;
        setState((s) => {
            ref.current = Object.assign(Object.assign({}, s), { edited: Object.assign(Object.assign({}, s.edited), { [key]: s.initialData[key] !== value }), data: Object.assign(Object.assign({}, s.data), { [key]: value }) });
            if (!disableAutoSave) {
                patch(ref.current);
            }
            return ref.current;
        });
    }, [props.disableAutoSave, patch]);
    const save = react_1.useCallback(() => patch(ref.current), [patch]);
    const setData = react_1.useCallback((data) => {
        setState((s) => getNewState(Object.assign(Object.assign({}, s.data), data), s.edited));
    }, []);
    const actions = react_1.useMemo(() => ({ read: fetch('GET'), delete: fetch('DELETE') }), [fetch]);
    react_1.useEffect(() => {
        if (!init.current && props.initWithGet && id) {
            init.current = true;
            actions.read();
        }
    }, [props.initWithGet, id, actions.read]);
    return [state, set, save, setData, actions];
}
exports.useCrud = useCrud;
function getPatchData(state) {
    const patchData = {};
    for (const key in state.edited) {
        if (state.edited[key]) {
            patchData[key] = state.data[key];
        }
    }
    return patchData;
}
function getNewState(data, edited = {}) {
    return {
        busy: false,
        data,
        initialData: data,
        edited,
    };
}

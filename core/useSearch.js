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
exports.useSearch = void 0;
const React = require("react");
const react_1 = require("react");
const reach_1 = require("@ewb/reach");
const ReachContext_1 = require("./ReachContext");
function useSearch(path, props) {
    const { limit = 10, responseToData, reachOptions } = props;
    const init = React.useRef(false);
    const service = React.useContext(ReachContext_1.ReachContext);
    const [state, setState] = React.useState({
        busy: true,
        limit: limit || 10,
        skip: 0,
        count: 0,
        items: [],
        searchQuery: {},
    });
    const reach = React.useMemo(() => new reach_1.Reach(service), [service]);
    const query = React.useMemo(() => (Object.assign(Object.assign(Object.assign({}, props.query), state.searchQuery), { limit: state.limit, skip: state.skip })), [props.query, state.limit, state.skip, state.searchQuery]);
    const search = React.useCallback((skip, searchQuery = {}) => __awaiter(this, void 0, void 0, function* () {
        try {
            let data = yield reach.api(path, Object.assign(Object.assign({}, reachOptions), { query: searchQuery ? Object.assign(Object.assign(Object.assign({}, query), searchQuery), { skip }) : Object.assign(Object.assign({}, query), { skip }) }));
            const newState = { skip, searchQuery, busy: false };
            if (typeof responseToData === 'function') {
                const { count, items } = responseToData(data);
                setState((s) => (Object.assign(Object.assign(Object.assign({}, s), newState), { count, items: skip ? [...s.items, ...items] : items })));
                return;
            }
            if (!Array.isArray(data)) {
                throw new Error('useSearch error. data response is not typeof array. Use responseToData to parse response');
            }
            setState((s) => (Object.assign(Object.assign(Object.assign({}, s), newState), { items: skip ? [...s.items, ...data] : data })));
        }
        catch (error) {
            setState((s) => (Object.assign(Object.assign({}, s), { busy: false, error })));
        }
    }), [path, query, responseToData, reachOptions]);
    const next = react_1.useCallback(() => __awaiter(this, void 0, void 0, function* () {
        if (state.items.length < state.count) {
            setState((s) => (Object.assign(Object.assign({}, s), { busy: true })));
            yield search(state.skip + state.limit);
        }
    }), [state.items.length, state.count, search, state.skip, state.limit]);
    const info = React.useMemo(() => ({
        limit: state.limit,
        skip: state.skip,
        count: state.count,
    }), [state.limit, state.skip, state.count]);
    const actions = React.useMemo(() => ({
        unshift: (...items) => {
            setState((s) => (Object.assign(Object.assign({}, s), { items: [...items, ...s.items], count: s.count + items.length })));
        },
        splice: (start, deleteCount = 1, ...items) => {
            setState((s) => {
                s.items.splice(start, deleteCount, ...items);
                return Object.assign(Object.assign({}, s), { items: [...s.items], count: s.count - deleteCount + items.length });
            });
        },
        push: (...items) => {
            setState((s) => {
                return Object.assign(Object.assign({}, s), { items: [...s.items, ...items], count: s.count + items.length });
            });
        },
        search: (query) => search(0, query),
    }), [search]);
    React.useEffect(() => {
        if (!init.current && !props.disableInit) {
            init.current = true;
            search(0).then();
        }
    }, [search, props.disableInit]);
    return React.useMemo(() => [state.busy, state.items, state.error, next, info, actions], [state.busy, state.items, state.error, next, info, actions]);
}
exports.useSearch = useSearch;

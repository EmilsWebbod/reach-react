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
exports.useReach = void 0;
const React = require("react");
const reach_1 = require("@ewb/reach");
const ReachContext_1 = require("./ReachContext");
function useReach(path, props) {
    const init = React.useRef(false);
    const service = React.useContext(ReachContext_1.ReachContext);
    const [state, setState] = React.useState({ busy: true });
    const reach = React.useMemo(() => new reach_1.Reach(service), [service]);
    const fetch = React.useCallback(() => __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield reach.api(path, props);
            setState((s) => (Object.assign(Object.assign({}, s), { busy: false, data })));
        }
        catch (error) {
            setState((s) => (Object.assign(Object.assign({}, s), { busy: false, error })));
        }
    }), [path, props]);
    React.useEffect(() => {
        if (!init.current) {
            init.current = true;
            fetch().then();
        }
    }, [fetch]);
    return [state.busy, state.data, state.error, fetch];
}
exports.useReach = useReach;

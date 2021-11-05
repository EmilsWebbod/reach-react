"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReachConsumer = exports.ReachProvider = exports.ReachContext = void 0;
const React = require("react");
const reach_1 = require("@ewb/reach");
exports.ReachContext = React.createContext(new reach_1.ReachService('', {}));
exports.ReachProvider = exports.ReachContext.Provider;
exports.ReachConsumer = exports.ReachContext.Consumer;

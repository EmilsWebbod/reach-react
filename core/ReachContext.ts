import * as React from 'react';
import {ReachService} from '@ewb/reach';

export const ReachContext = React.createContext<ReachService>(new ReachService('', {}));
export const ReachProvider = ReachContext.Provider;
export const ReachConsumer = ReachContext.Consumer;

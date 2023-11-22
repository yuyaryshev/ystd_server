import deepMerge from "deepmerge";
import { ManageableTimer } from "ystd";

export type OnTerminateCallback = () => Promise<void> | void;

export interface EnvBase {
    onTerminateCallbacks: OnTerminateCallback[];
    terminating: boolean;
    timers: Set<ManageableTimer>;
    terminate: () => Promise<void>;
}

export function emptyEnv(): EnvBase {
    const pthis: EnvBase = {
        onTerminateCallbacks: [],
        terminating: false,
        timers: new Set<ManageableTimer>(),
        terminate: async () => {
            pthis.terminating = true;
            for (const timer of pthis.timers) timer.cancel();
            for (const callback of pthis.onTerminateCallbacks) await callback();
        },
    };
    return pthis;
}

export function mergeEnv<T1, T2>(existingEnv: T1 | undefined, addedEnv: T2): T1 & T2 {
    // @ts-ignore
    const pthis = Object.assign(existingEnv || {}, deepMerge(addedEnv, existingEnv || {}));
    return pthis as any as T1 & T2;
}

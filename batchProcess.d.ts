/// <reference path="c:/development/Netsuite/SuiteScriptAPITS.d.ts" />
interface JobContext {
    getTargetsUsage: () => number;
    getMaxUsage: () => number;
}
declare function batchProcess(getContext: (ctx: JobContext) => JobContext, getTargets: (ctx: JobContext, isRerunCheck: boolean) => Object[], processTarget: (ctx: JobContext, simpleArg?: any) => boolean, rerunParams: (ctx: JobContext) => void): void;

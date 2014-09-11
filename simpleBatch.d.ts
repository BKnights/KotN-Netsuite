/// <reference path="c:/development/Netsuite/SuiteScriptAPITS.d.ts" />
declare function simpleBatch(arr: any[], proc: (t: any, idx: number, a: any[]) => void, reserve?: number, maxMinutes?: number): void;
declare function dynamicBatch(arr: any[], proc: (t: any) => void, reserve?: number, maxMinutes?: number): void;

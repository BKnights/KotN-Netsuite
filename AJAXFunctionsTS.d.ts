declare  module KOTNUtil {
    export function sendJSResponse(request: nlobjRequest, response: nlobjResponse, respObject: any): void;
    export function unique(arr): any[];
    export function toJSON(target): string;
}

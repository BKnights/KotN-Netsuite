module statecountries {
    export var stateList: { id: string; c: string; sn: string; fn: string; }[];
    export var countryList: { fn: string; id: number; }[];
    export function getCountriesWithStates(): any[];
    export function getStates(countryCode);
    export function getStateId(countryCode, stateCode): string;
    export function getStateCodeById(id): string;
    export function getStateListByCountryId(id);
    export function getCountryCodeById(id, fallbackToName?: bool): string;
}

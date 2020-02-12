export interface ILooseObject {
    [prop: string]: any;
}

export interface IReducerSlice {
    initial: any;
    actions?: ILooseObject;
    selectors?: {};
    slice: string;
}

export interface IAutoReducerSlice {
    initial: any;
    reducer: {};
    slice: string;
    actions: ILooseObject;
    selectors: ILooseObject;
}

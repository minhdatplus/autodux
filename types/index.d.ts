declare module "autodux" {
    interface LooseObject {
        [prop: string]: any,
        selectTime: any
    }

    interface ReducerSlice {
        initial: any,
        actions?: LooseObject,
        selectors?: {},
        slice: string
    }

    interface AutoReducerSlice {
        initial: any,
        reducer: {},
        slice: string,
        actions: LooseObject,
        selectors: LooseObject
    }

    const autodux: (arguments: ReducerSlice) => AutoReducerSlice;

    export = autodux
}
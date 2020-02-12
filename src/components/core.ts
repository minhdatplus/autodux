import {path, prop} from "ramda";

import {SLICE_VALUE_ERROR} from "./errors";
import {
    getActionCreatorName,
    getSelectorName,
    getType,
    id,
    isFunction,
    isPrimitive,
    isSliceValid,
    selectIfFunction,
} from "./heplers";

import {IAutoReducerSlice, ILooseObject, IReducerSlice} from "./model";

/**
 * Create action creator for given slice (with optional payload mapper).
 */
const createActionCreator = (slice: string, name: string, mapPayload: any) => {
    const type = getType(slice, name);
    return Object.assign(
        (...args: any[]) => ({
            payload: isFunction(mapPayload) ? mapPayload(...args) : args[0],
            type,
        }),
        {type},
    );
};

/**
 * Create reducer for given key from initial state.
 */
const createReducer = (key: string) => (state: any, payload: any) =>
    !key && isPrimitive(payload)
        ? payload
        : Object.assign({}, state, key ? {[key]: payload} : payload);

/**
 * Create selector for given slice.
 */
const createSelector = (slice: string, fn: any) => (state: any) => fn(state[slice], state);

/**
 * Create default action creators, reducers and selectors.
 */
const createDefaults = (slice: string, initial: object) => {
    const sliceActionCreatorName = getActionCreatorName(slice);

    return Object.keys(initial).reduce(
        ([actionCreators, reducers, selectors], key) => {
            const actionCreatorName = getActionCreatorName(key);

            return [
                Object.assign(actionCreators, {
                    [actionCreatorName]: createActionCreator(slice, actionCreatorName, {}),
                }),
                Object.assign(reducers, {
                    [actionCreatorName]: createReducer(key),
                }),
                Object.assign(selectors, {
                    [getSelectorName(key)]: createSelector(
                        slice,
                        (state: any) => prop(key, state),
                    ),
                }),
            ];
        },
        [
            {
                [sliceActionCreatorName]: createActionCreator(
                    slice,
                    sliceActionCreatorName, {},
                ),
            },
            {
                [sliceActionCreatorName]: createReducer("unknown"),
            },
            {
                [getSelectorName(slice)]: createSelector(
                    slice,
                    id,
                ),
            },
        ],
    );
};

/**
 * Produce action creators from user-defined 'actions' object.
 */
const createActionCreators = (slice: string, actions: any) =>
    Object.keys(actions).reduce(
        (obj, action) =>
            Object.assign({}, obj, {
                [action]: createActionCreator(slice, action, actions[action].create),
            }),
        {},
    );

/**
 * Produce selectors from user-defined 'selectors' object.
 */
const createSelectors = (slice: string, selectors: any) => {
    return Object.keys(selectors).reduce(
        (obj: object, key) =>
            Object.assign(obj, {
                [key]: createSelector(
                    slice,
                    selectors[key],
                ),
            }),
        {},
    );
};

/**
 * Validate options supplied to 'autodux'.
 */
const checkOptions = ({slice}: any) => {
    if (!isSliceValid(slice)) {
        throw new Error(SLICE_VALUE_ERROR);
    }
};

export function autodux(options: IReducerSlice) {
    checkOptions(options);
    // const {initial = "", actions = {}, selectors = {}, slice} = options;
    const initial: any = options.initial;
    const actions: any = options.actions;
    const selectors: any = options.selectors;
    const slice: any = options.slice;

    const [
        defaultActionCreators,
        defaultReducers,
        defaultSelectors,
    ] = createDefaults(slice, initial);

    const allSelectors = Object.assign(
        {},
        defaultSelectors,
        createSelectors(slice, selectors),
    );

    const allActions = Object.assign(
        {},
        defaultActionCreators,
        createActionCreators(slice, actions),
    );

    const rootReducer = (
        state = initial,
        {type = getType("unknown", "unknown"), payload = {}} = {},
    ) => {
        const [namespace, subType] = type.split("/");

        // Look for reducer with top-to-bottom precedence.
        // Fall back to default actions, then undefined.
        // 'actions[subType]' key can be a function or an object,
        // so the value is selected only if it's a function:
        const reducer = [
            path([subType, "reducer"], actions),
            actions[subType],
            defaultReducers[subType],
        ].reduceRight((f, v) => selectIfFunction(v) || f);

        return namespace === slice && (actions[subType] || defaultReducers[subType])
            ? reducer
                ? reducer(state, payload)
                : Object.assign({}, state, payload)
            : state;
    };

    return {
        actions: allActions,
        initial,
        reducer: rootReducer,
        selectors: allSelectors,
        slice,
    };
}

/**
 * Create reducer that assigns payload to the given key.
 */
export const assign = (key: string) => (state: any, payload: any) =>
    Object.assign({}, state, {
        [key]: payload,
    });

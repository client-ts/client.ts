import {RouteDef} from "../types/client";
import {PureRoute} from "../types/builder";
import {RoutePath} from "../types/http";

export const staticRoute =
    <Response> (path: RoutePath) => route<Response, []>(path)

export function dynamicRoute<Response>() {
    return function <Args extends any[]>(callback: (...args: Args) => string | PureRoute<Response>) {
        return route<Response, Args>(callback);
    };
}

export function createRoute<Response>() {
    return {
        dynamic: dynamicRoute<Response>(),
        static: staticRoute<Response>
    } as const
}

export function createSingleAndArrayedRoute<Response>() {
    return {
        single: createRoute<Response>(),
        arrayed: createRoute<Response[]>()
    } as const
}

export function route<Response, Args extends any[]>(
    constructor: string |
        ((...args: Args) => string | PureRoute<Response>)
): RouteDef<Response, Args> {
    return {
        _constructor: typeof constructor === "string" ? () => constructor : constructor,
    };
}

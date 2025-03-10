import {RouteDef} from "../../types/client";
import {PureRoute} from "../../types/builder";
import {decodeRoute} from "../utils/http";
import {withDefault} from "../utils/objects";
import {HttpMethods} from "../../types/http";

type ResourceRouteDecodeObject = {
    routeName: string,
    isStatic: boolean,
    result: (PureRoute<any> | string),
    set: (key: string, value: any) => void,
    get: (key: string) => any
}

export function decodeResourceRoute({ routeName, isStatic, result, set, get}: ResourceRouteDecodeObject): [HttpMethods, string] {
    const isStringRoute = typeof result === "string";

    let _method, _path: string;
    if (isStatic && isStringRoute) {
        const cacheKey = `${routeName}_appliedRoute`;

        const existingDecodedRoute = get(cacheKey);
        const resolvedDecodedRoute = withDefault(existingDecodedRoute, decodeRoute(undefined, result));

        _method = resolvedDecodedRoute.method
        _path = resolvedDecodedRoute.path

        if (!existingDecodedRoute) {
            set(cacheKey, {method:_method, path:_path});
        }
    } else {
        let { method, path } =  isStringRoute
            ? decodeRoute(undefined, result)
            : decodeRoute(result.method, result!.route);

        _method = method;
        _path = path;
    }
    return [_method, _path] as const;
}

import {HttpMethods, QueryParameters} from "../../types/http";

export function decodeRoute(method: string | undefined, route: string) {
    const tokens = route.split(" ", 2);
    if (tokens.length === 1 && method == null) {
        return {method: method == null ? "GET" : method, path: route} as const
    }
    const [_method, path] = tokens;
    method = _method.toUpperCase();
    if (!["GET", "POST", "PUT", "DELETE", "PATCH"].includes(method)) {
        throw new Error(`Invalid HTTP method: ${method} at route: ${route}`)
    }
    return {
        method: method as HttpMethods,
        path: path
    } as const
}

export function createQueryParameters(parameters: QueryParameters): string {
    let params = "";
    for (let key in parameters) {
        const value = parameters[key];
        if (value === undefined || value === null) {
            continue
        }

        const encodedKey = encodeURIComponent(key)
        if (typeof value === "string") {
            const param = `${encodedKey}=${encodeURIComponent(value)}`
            if (params.length > 0) {
                params += `&${param}`;
            } else {
                params += `?${param}`;
            }
        } else {
            const param = `${encodedKey}=${value}`
            if (params.length > 0) {
                params += `&${param}`;
            } else {
                params += `?${param}`;
            }
        }
    }
    return params;
}

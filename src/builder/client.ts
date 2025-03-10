import {ClientBuilder, ClientBuilderOptions, PureRoute} from "../types/builder";
import {Client} from "../types/client";
import {Request} from "../types/http";
import {createRequest} from "../internal/client/request";
import {mergeObjects, withDefault, withDefaultEmptyArray, withDefaultEmptyObject} from "../internal/utils/objects";
import {executeRequest} from "../internal/client/fetch";
import {decodeResourceRoute} from "../internal/client/resourceRoute";
import {executeBeforeRequestHooks} from "../internal/client/hooks";

export function createClient<C extends ClientBuilder>(baseUrl: string, config: C, options?: ClientBuilderOptions): Client<C> {
    const client = {} as Client<C>;
    const global = {
        hooks: options?.hooks ?? [],
        headers: options?.headers ?? {},
        timeout: options?.timeout,
        additionalFetchOptions: options?.additionalFetchOptions ?? {},
        validators: options?.validators ?? [],
    }
    for (const [resourceName, resource] of Object.entries(config)) {
        const resourceClient = {} as any;
        const res = {
            hooks: resource.hooks ?? [],
            headers: resource.headers ?? {},
            timeout: resource.timeout,
            additionalFetchOptions: resource.additionalFetchOptions ?? {},
            validators: resource.validators,
        }

        const resourceStandardHeaders = mergeObjects(global.headers, res.headers)
        for (const [routeName, routeDef] of Object.entries(resource.routes)) {
            resourceClient[routeName] = async (...args: any[]) => {
                const result: (PureRoute<any> | string) = routeDef._constructor(...args);
                let [_method, _path] = decodeResourceRoute({
                    routeName,
                    result,
                    isStatic: typeof result === "string",
                    set: (key: string, value: any) => resourceClient[key] = value,
                    get: (key: string) => resourceClient[key]
                })

                let request: Request = typeof result === "string" ? createRequest({
                    headers: resourceStandardHeaders,
                    baseUrl: baseUrl,
                    method: _method,
                    path: _path,
                    decoder: JSON.parse,
                    encoder: JSON.stringify,
                    queryParameters: {},
                    timeout: withDefault(res.timeout, global.timeout),
                    additionalFetchOptions: {},
                }) : createRequest({
                    ...result,
                    headers: mergeObjects(resourceStandardHeaders, withDefaultEmptyObject(result.headers)),
                    method: withDefault(result.method, _method),
                    path: _path,
                    baseUrl: baseUrl,
                    timeout: withDefault(result.timeout, withDefault(res.timeout, global.timeout)),
                    additionalFetchOptions: withDefaultEmptyObject(result.additionalFetchOptions),
                })

                const requestHooks = withDefaultEmptyArray(request.hooks);

                // Declare the  of the hooks as well, wherein global hooks run first,
                // then resource hooks, then route hooks, and finally request hooks.
                const hooks = [...global.hooks, ...res.hooks, ...requestHooks];
                request = executeBeforeRequestHooks(request, hooks);

                const validators =  [...global.validators, ...withDefaultEmptyArray(resource.validators), ...withDefaultEmptyArray(request.validators)]
                const additionalFetchOptions = {
                    ...global.additionalFetchOptions,
                    ...res.additionalFetchOptions,
                    ...request.additionalFetchOptions
                }
                return await executeRequest(resource.prefix, request, hooks, validators, additionalFetchOptions)
            };
        }
        client[resourceName as keyof C] = resourceClient;
    }

    return client;
}

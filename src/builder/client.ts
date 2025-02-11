import {ClientBuilder, ClientBuilderOptions, Headers, PureRoute} from "../types/builder";
import {Client} from "../types/client";
import {BaseRequest, BaseResult, HttpMethods, Request, Result} from "../types/http";

export function createClient<C extends ClientBuilder>(baseUrl: string, config: C, options?: ClientBuilderOptions): Client<C> {
    const client = {} as Client<C>;
    const global = {
        hooks: options?.hooks ?? [],
        headers: options?.headers ?? {},
        timeout: options?.timeout,
        additionalFetchOptions: options?.additionalFetchOptions ?? {},
    }
    for (const [resourceName, resource] of Object.entries(config)) {
        const resourceClient = {} as any;
        const res = {
            hooks: resource.hooks ?? [],
            headers: resource.headers ?? {},
            timeout: resource.timeout,
            additionalFetchOptions: resource.additionalFetchOptions ?? {},
        }

        const resourceStandardHeaders = mergeObjects(global.headers, res.headers)
        for (const [routeName, routeDef] of Object.entries(resource.routes)) {
            resourceClient[routeName] = async (...args: any[]) => {
                const result: (PureRoute<any> | string) = routeDef._constructor(...args);
                const isStringRoute = typeof result === "string";

                let _method, _path: string;
                if (routeDef._static && isStringRoute) {
                    const existingDecodedRoute = resourceClient[routeName + "_appliedRoute"];
                    const resolvedDecodedRoute = existingDecodedRoute ?? decodeRoute(undefined, result)

                    _method = resolvedDecodedRoute.method
                    _path = resolvedDecodedRoute.path

                    if (!existingDecodedRoute) {
                        resourceClient[routeName + "_appliedRoute"] = {method:_method, path:_path};
                    }
                } else {
                    let { method, path } =  isStringRoute ?
                        decodeRoute(undefined, result) : decodeRoute(result.method, result!.route)
                    _method = method
                    _path = path
                }

                let request: Request = isStringRoute ? createRequest({
                    headers: resourceStandardHeaders,
                    baseUrl: baseUrl,
                    method: _method,
                    path: _path,
                    decoder: JSON.parse,
                    encoder: JSON.stringify,
                    queryParameters: {},
                    timeout: res.timeout ?? global.timeout,
                    additionalFetchOptions: {},
                }) : createRequest({
                    ...result,
                    headers: mergeObjects(resourceStandardHeaders, result.headers ?? {}),
                    method: result.method ?? _method,
                    path: _path,
                    baseUrl: baseUrl,
                    timeout: result.timeout ?? res.timeout ?? global.timeout,
                    additionalFetchOptions: result.additionalFetchOptions ?? {},
                })

                const requestHooks = request.hooks ?? [];
                // Declare the predence of the hooks as well, wherein global hooks run first,
                // then resource hooks, then route hooks, and finally request hooks.
                const hooks = [...global.hooks, ...res.hooks, ...requestHooks];
                for (const hook of hooks) {
                    if (hook.beforeRequest) {
                        request = hook.beforeRequest(request);
                    }
                }

                let method: string = request.method ?? "GET";
                let path: string = request.path;
                let body: any = request.body;
                let headers: Headers | undefined = request.headers;
                let encoder: (body: any) => string = request.encoder ?? JSON.stringify;
                let decoder: (body: string) => any = request.decoder ?? JSON.parse;

                let fullPath = request.baseUrl;
                if (resource.prefix) {
                    fullPath += resource.prefix;
                }
                fullPath += path;

                if (request.queryParameters) {
                    const url = new URL(fullPath);
                    for (const [key, value] of Object.entries(request.queryParameters)) {
                        url.searchParams.append(key, value.toString())
                    }
                    fullPath = url.toString()
                }

                // Auto-apply the JSON Content-Type header if the body is an object.
                if (encoder === JSON.stringify && request.headers?.['Content-Type'] === undefined) {
                    request = request.merge({
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                }

                const additionalFetchOptions = {
                    ...global.additionalFetchOptions,
                    ...res.additionalFetchOptions,
                    ...request.additionalFetchOptions
                }

                return fetch(fullPath, {
                    method,
                    body: body ?
                        (
                            typeof body === "string" ||
                            body instanceof ReadableStream ||
                            body instanceof FormData ||
                            body instanceof ArrayBuffer ||
                            body instanceof URLSearchParams
                        ) ? body : encoder(body) : undefined,
                    headers,
                    signal:
                        request.abortSignal ??
                        (request.timeout ? AbortSignal.timeout(request.timeout) : undefined),
                    ...additionalFetchOptions
                }).
                then(async (res) => {
                    let result: any = null;
                    try {
                        result = decoder === JSON.parse ?
                            await res.json() :
                            await res.text().then(decoder)
                    } catch (e) {
                        throw e
                    }
                    return createResult<any>({
                        request: {
                            url: fullPath,
                            method: method as HttpMethods,
                        },
                        headers: res.headers,
                        statusCode: res.status,
                        data: result,
                    })
                }).
                    then((res) => {
                        for (const hook of hooks) {
                            if (hook.afterRequest) {
                                res = hook.afterRequest(request, res);
                            }
                        }
                        return res
                    });
            };
        }
        client[resourceName as keyof C] = resourceClient;
    }

    return client;
}

function decodeRoute(method: string | undefined, route: string) {
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

function mergeObjects<A, B>(a: A, b: B): A {
    return {
        ...a,
        ...b
    }
}

function createRequest(base: BaseRequest): Request {
    return {
        ...base,
        addHeaders(headers: Headers) {
            this.headers = mergeObjects(this.headers, headers)
        },
        setHeaders(headers: Headers) {
            this.headers = headers
        },
        addQueryParameters(queryParameters: { [key: string]: string | number | boolean }) {
            this.queryParameters = mergeObjects(this.queryParameters, queryParameters)
        },
        setQueryParameters(queryParameters: { [key: string]: string | number | boolean }) {
            this.queryParameters = queryParameters
        },
        setBody(body: any) {
            this.body = body
        },
        setEncoder(encoder: (body: any) => string) {
            this.encoder = encoder
        },
        setDecoder(decoder: (body: string) => any) {
            this.decoder = decoder
        },
        setPath(path: string) {
            this.path = path
        },
        setMethod(method: HttpMethods) {
            this.method = method
        },
        setBaseUrl(baseUrl: string) {
            this.baseUrl = baseUrl
        },
        setTimeout(timeout: number) {
            this.timeout = timeout
        },
        setAbortSignal(signal: AbortSignal) {
            this.abortSignal = signal
        },
        merge(request: Partial<Request>): Request {
            const newRequest = mergeObjects(this, request)
            if (request.headers) {
                newRequest.headers = mergeObjects(this.headers, request.headers)
            }
            if (request.hooks) {
                newRequest.hooks = mergeObjects(this.hooks, request.hooks)
            }
            return newRequest
        }
    }
}

function createResult<Type>(base: BaseResult<Type>): Result<Type> {
    return {
        ...base,
        merge(result: Partial<Result<Type>>): Result<Type> {
            const newResult = mergeObjects(this, result)
            if (result.headers) {
                newResult.headers = mergeObjects(this.headers, result.headers)
            }
            return newResult
        }
    }
}

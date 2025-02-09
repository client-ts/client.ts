import {ClientBuilder, ClientBuilderOptions, Headers, PureRoute} from "../types/builder";
import {Client} from "../types/client";
import {BaseRequest, BaseResult, Connector, Request, Result} from "../types/http";

function createRequest(base: BaseRequest): Request {
    return {
        ...base,
        addHeaders(headers: Headers) {
            this.headers = {
                ...this.headers,
                ...headers
            }
        },
        setHeaders(headers: Headers) {
            this.headers = headers
        },
        addQueryParameters(queryParameters: { [key: string]: string | number | boolean }) {
            this.queryParameters = {
                ...this.queryParameters,
                ...queryParameters
            }
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
        setMethod(method: "GET" | "POST" | "PUT" | "DELETE") {
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
            const newRequest = {
                ...this,
                ...request
            }

            // Properly merge the array properties since they should be merged
            // instead of being replaced entirely, like new properties be added.
            if (request.headers) {
                newRequest.headers = {
                    ...this.headers,
                    ...request.headers
                }
            }
            if (request.hooks) {
                newRequest.hooks = {
                    ...this.hooks,
                    ...request.hooks
                }
            }

            return newRequest
        }
    }
}

function createResult<Type>(base: BaseResult<Type>): Result<Type> {
    return {
        ...base,
        merge(result: Partial<Result<Type>>): Result<Type> {
            const newResult = {
                ...this,
                ...result
            }
            // Properly merge the array properties since they should be merged
            // instead of being replaced entirely, like new properties be added.
            if (result.headers) {
                newResult.headers = {
                    ...this.headers,
                    ...result.headers
                }
            }
            return newResult
        }
    }
}

export function createClient<C extends ClientBuilder>(baseUrl: string, config: C, options?: ClientBuilderOptions): Client<C> {
    const client = {} as Client<C>;
    let connector: Connector = fetch;
    if (options && options.connector != null) {
        connector = options.connector
    }

    const global = {
        hooks: options?.hooks ?? [],
        headers: options?.headers ?? {},
        timeout: options?.timeout
    }
    for (const [resourceName, resource] of Object.entries(config)) {
        const resourceClient = {} as any;
        const res = {
            hooks: resource.hooks ?? [],
            headers: resource.headers ?? {},
            timeout: resource.timeout
        }

        const resourceStandardHeaders = {
            ...global.headers,
            ...res.headers,
        }
        for (const [routeName, routeDef] of Object.entries(resource.routes)) {
            resourceClient[routeName] = async (...args: any[]) => {
                const result: (PureRoute<any> | string) = routeDef._constructor(...args);

                let request: Request = typeof result === "string" ? createRequest({
                    headers: resourceStandardHeaders,
                    baseUrl: baseUrl,
                    method: result.split(" ")[0] as "GET" | "POST" | "PUT" | "DELETE",
                    path: result.split(" ")[1],
                    decoder: JSON.parse,
                    encoder: JSON.stringify,
                    queryParameters: {},
                    timeout: res.timeout ?? global.timeout,
                }) : createRequest({
                    ...result,
                    headers: {
                        ...resourceStandardHeaders,
                        ...result.headers ?? {},
                    },
                    method: result.method ?? result.route.split(" ")[0] as "GET" | "POST" | "PUT" | "DELETE",
                    path: result.route.split(" ")[1],
                    baseUrl: baseUrl,
                    timeout: result.timeout ?? res.timeout ?? global.timeout,
                })

                const routeHooks = typeof result === "string" ? [] : result.hooks ?? [];
                const requestHooks = request.hooks ?? [];

                // Declare the predence of the hooks as well, wherein global hooks run first,
                // then resource hooks, then route hooks, and finally request hooks.
                const hooks = [...global.hooks, ...res.hooks, ...routeHooks, ...requestHooks];
                for (const hook of hooks) {
                    if (hook.beforeRequest) {
                        request = hook.beforeRequest(request);
                    }
                }

                let method: string = request.method ?? "GET";
                let path: string = request.path;
                let body: any = request.body;
                let headers: any = request.headers;
                let encoder: (body: any) => string = request.encoder ?? JSON.stringify;
                let decoder: (body: string) => any = request.decoder ?? JSON.parse;

                let fullPath = request.baseUrl;
                if (resource.prefix) {
                    fullPath += resource.prefix;
                }
                fullPath += path;

                const url = new URL(fullPath);
                if (request.queryParameters) {
                    for (const [key, value] of Object.entries(request.queryParameters)) {
                        url.searchParams.append(key, value.toString())
                    }
                }

                // Auto-apply the JSON Content-Type header if the body is an object.
                if (encoder === JSON.stringify && request.headers?.['Content-Type'] === undefined) {
                    request = request.merge({
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                }

                return connector(url.toString(), {
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

import {ClientBuilder, ClientBuilderOptions, PureRoute} from "../types/builder";
import {Client} from "../types/client";
import {Connector, Request, Result} from "../types/http";

export function createClient<C extends ClientBuilder>(baseUrl: string, config: C, options?: ClientBuilderOptions): Client<C> {
    const client = {} as Client<C>;
    let connector: Connector = fetch;
    if (options && options.connector != null) {
        connector = options.connector
    }

    const globals = {
        middlewares: options?.middlewares ?? [],
        afterwares: options?.afterwares ?? []
    }
    for (const [resourceName, resource] of Object.entries(config)) {
        const resourceClient = {} as any;
        for (const [routeName, routeDef] of Object.entries(resource.routes)) {
            resourceClient[routeName] = async (...args: any[]) => {
                const result: (PureRoute<any> | string) = routeDef._constructor(...args);
                let request: Request = typeof result === "string" ? {
                    headers: {},
                    baseUrl: baseUrl,
                    method: result.split(" ")[0] as "GET" | "POST" | "PUT" | "DELETE",
                    path: result.split(" ")[1],
                    decoder: JSON.parse,
                    encoder: JSON.stringify
                } : {
                    ...result,
                    method: result.method ?? result.route.split(" ")[0] as "GET" | "POST" | "PUT" | "DELETE",
                    path: result.route.split(" ")[1],
                    baseUrl: baseUrl
                }

                const local = {
                    middlewares: resource.middlewares ?? [],
                    afterwares: resource.afterwares ?? []
                }

                const middlewares = [...globals.middlewares, ...local.middlewares];
                for (const middleware of middlewares) {
                    request = middleware(request);
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

                return connector(fullPath, {
                    method,
                    body: body ?
                        (
                            typeof body === "string" ||
                            body instanceof ReadableStream ||
                            body instanceof FormData ||
                            body instanceof ArrayBuffer ||
                            body instanceof URLSearchParams
                        ) ? body : encoder(body) : undefined,
                    headers
                }).
                then(async (res) => {
                    let [result, err]: [any, any] = [null, null];
                    try {
                        result = decoder === JSON.parse ?
                            await res.json() :
                            await res.text().then(decoder)
                    } catch (e) {
                        err = e
                    }
                    return {
                        headers: res.headers,
                        statusCode: res.status,
                        result: result,
                        decodeError: err
                    } as Result<any>
                }).
                    then((res) => {
                        const afterwares = [...globals.afterwares, ...local.afterwares];
                        for (const afterware of afterwares) {
                            afterware(request, res);
                        }
                        return res
                    });
            };
        }
        client[resourceName as keyof C] = resourceClient;
    }

    return client;
}

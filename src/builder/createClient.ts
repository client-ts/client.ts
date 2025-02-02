import {ClientBuilder, ClientBuilderOptions, Connector, PureRoute, Request} from "../types/builder";
import {Client} from "../types/client";

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
                const afterwares = [...globals.afterwares, ...local.afterwares];

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
                then(res => decoder === JSON.parse ? res.json() : res.text().then(decoder)).
                    then((res) => {
                        async function runAfterwares() {
                            for (const afterware of afterwares) {
                                afterware(request);
                            }
                        }
                        runAfterwares();
                        return res
                    });
            };
        }
        client[resourceName as keyof C] = resourceClient;
    }

    return client;
}

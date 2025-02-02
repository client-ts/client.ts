import {RequestConsumer, RouteDef} from "./client";

export type ClientBuilder = {
    [key: string]: Resource
}

export type Connector = (path: string, init: RequestInit) => Promise<{ text(): Promise<string>, json(): Promise<*> }>
export type ClientBuilderOptions = {
    connector?: Connector
} & WithConsumers

export type WithConsumers = {
    afterwares?: RequestConsumer[],
    middlewares?: RequestConsumer[]
}

export type Resource = {
    prefix?: string,
    routes: {
        [key: string]: RouteDef<any, any[]>
    }
} & WithConsumers

export type Request = {
    baseUrl: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: any,
    headers?: {
        [key: string]: any
    }
    encoder?: (body: any) => string
    decoder?: (body: string) => Response
}

export type PureRoute<Response> = {
    method?: "GET" | "POST" | "PUT" | "DELETE",
    route: string,
    body?: any,
    headers?: {
        [key: string]: any
    }
    encoder?: (body: any) => string
    decoder?: (body: string) => Response
}

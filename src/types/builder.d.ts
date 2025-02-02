import {RequestConsumer, ResultConsumer, RouteDef} from "./client";

export type ClientBuilder = {
    [key: string]: Resource
}

export type ClientBuilderOptions = {
    connector?: Connector
} & WithConsumers

export type WithConsumers = {
    afterwares?: ResultConsumer[],
    middlewares?: RequestConsumer[]
}

export type Resource = {
    prefix?: string,
    routes: {
        [key: string]: RouteDef<any, any[]>
    }
} & WithConsumers

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

import {RouteDef} from "./client";
import {Hook} from "./hook";

export type ClientBuilder = {
    [key: string]: Resource
}

export type ClientBuilderOptions = {
    connector?: Connector
} & WithHooks & WithHeaders

export type WithHooks = {
    hooks?: Hook[]
}

export type Headers = {
    [key: string]: any
}

export type WithHeaders = {
    headers?: Headers
}

export type Encoder = (body: any) => string
export type Decoder<T> = (body: string) => T
export type WithEncoderDecoder<T> = {
    encoder?: Encoder,
    decoder?: Decoder<T>
}

export type Resource = {
    prefix?: string,
    routes: {
        [key: string]: RouteDef<any, any[]>
    },
} & WithHooks & WithHeaders

export type PureRoute<Response> = {
    method?: "GET" | "POST" | "PUT" | "DELETE",
    route: string,
    body?: any
} & WithHooks & WithHeaders & WithEncoderDecoder<Response>

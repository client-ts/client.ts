import {RouteDef} from "./client";
import {Hook} from "./hook";
import {QueryParameters, RoutePath} from "./http";
import {Validator} from "./validator";

export type ClientBuilder = {
    [key: string]: Resource
}

export type ClientBuilderOptions = WithHooks
    & WithHeaders
    & WithTimeout
    & WithAdditionalFetchOptions
    & WithValidators

export type WithHooks = {
    hooks?: Hook[]
}

export type Headers = {
    [key: string]: any
}

export type WithTimeout = {
    timeout?: number,
}

export type WithAbortSignal = {
    abortSignal?: AbortSignal
}

export type WithHeaders = {
    headers?: Headers
}

export type WithValidators = {
    validators?: Validator[];
}

export type WithAdditionalFetchOptions = {
    // Merged into the fetch options object, in case you need to add options
    // that we do not support by default, because of either compatibility between
    // environments, or other reasons.
    additionalFetchOptions?: any
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
}   & WithHooks
    & WithHeaders
    & WithTimeout
    & WithAdditionalFetchOptions
    & WithValidators

export type PureRoute<Response> = {
    method?: "GET" | "POST" | "PUT" | "DELETE",
    route: RoutePath,
    body?: any,
    queryParameters?: QueryParameters,
}   & WithHooks
    & WithHeaders
    & WithEncoderDecoder<Response>
    & WithAbortSignal
    & WithTimeout
    & WithAdditionalFetchOptions
    & WithValidators

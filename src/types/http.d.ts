import {
    WithEncoderDecoder,
    WithHeaders,
    WithHooks,
    Headers,
    WithTimeout,
    WithAbortSignal,
    WithAdditionalFetchOptions
} from "./builder";

export type QueryParameters = {
    [key: string]: string | number | boolean
}


export type HttpMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

export type BaseRequest = {
    baseUrl: string,
    method: HttpMethods,
    path: string,
    queryParameters?: QueryParameters,
    body?: any,
}   & WithHeaders
    & WithEncoderDecoder<any>
    & WithHooks
    & WithTimeout
    & WithAbortSignal
    & WithAdditionalFetchOptions

export type Request = BaseRequest & {
    setBody(body: any),
    setHeaders(headers: Headers),
    addHeaders(headers: Headers),
    setEncoder(encoder: Encoder),
    setDecoder(decoder: Decoder<any>),
    setQueryParameters(queryParameters: QueryParameters),
    addQueryParameters(queryParameters: QueryParameters),
    setTimeout(timeout: number),
    setAbortSignal(signal: AbortSignal),
    setPath(path: string),
    setMethod(method: "GET" | "POST" | "PUT" | "DELETE"),
    setBaseUrl(baseUrl: string),
    merge(request: Partial<Request>): Request
}

export type BaseResult<Type> = {
    request: {
        url: string,
        method: HttpMethods,
    }
    headers: Headers,
    statusCode: number,
    data: Type | null,
}

export type Result<Type> = BaseResult<Type> & {
    merge(request: Partial<Result<Type>>): Result<Type>
}

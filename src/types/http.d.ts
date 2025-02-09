import {WithEncoderDecoder, WithHeaders, WithHooks, Headers, WithTimeout, WithAbortSignal} from "./builder";

export type Connector = (path: string, init: RequestInit) => Promise<{
    text(): Promise<string>,
    json(): Promise<any>,
    headers: any,
    status: number
}>

export type QueryParameters = {
    [key: string]: string | number | boolean
}

export type BaseRequest = {
    baseUrl: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    queryParameters?: QueryParameters,
    body?: any,
}   & WithHeaders
    & WithEncoderDecoder<any>
    & WithHooks
    & WithTimeout
    & WithAbortSignal

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
    headers: Headers,
    statusCode: number,
    data: Type | null,
}

export type Result<Type> = BaseResult<Type> & {
    merge(request: Partial<Result<Type>>): Result<Type>
}

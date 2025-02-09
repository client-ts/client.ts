import {WithEncoderDecoder, WithHeaders, WithHooks} from "./builder";

export type Connector = (path: string, init: RequestInit) => Promise<{
    text(): Promise<string>,
    json(): Promise<any>,
    headers: any,
    status: number
}>

export type BaseRequest = {
    baseUrl: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: any,
} & WithHeaders & WithEncoderDecoder<any> & WithHooks

export type Request = BaseRequest & {
    setBody(body: any),
    setHeaders(headers: Headers),
    addHeaders(headers: Headers),
    setEncoder(encoder: Encoder),
    setDecoder(decoder: Decoder<any>),
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

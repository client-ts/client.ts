import {Request, BaseRequest, HttpMethods} from "../../types/http";
import type { Headers } from "../../types/builder";
import {mergeObjects} from "../utils/objects";
import {createQueryParameters} from "../utils/http";

export function createRequest(base: BaseRequest): Request {
    return {
        ...base,
        addHeaders(headers: Headers) {
            this.headers = mergeObjects(this.headers, headers)
        },
        setHeaders(headers: Headers) {
            this.headers = headers
        },
        addQueryParameters(queryParameters: { [key: string]: string | number | boolean }) {
            this.queryParameters = mergeObjects(this.queryParameters, queryParameters)
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
        setMethod(method: HttpMethods) {
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
            const newRequest = mergeObjects(this, request)
            if (request.headers) {
                newRequest.headers = mergeObjects(this.headers, request.headers)
            }
            if (request.hooks) {
                newRequest.hooks = mergeObjects(this.hooks, request.hooks)
            }
            return newRequest
        }
    }
}

export function createRequestPath(prefix: string | undefined, path: string, request: Request): string {
    let fullPath = request.baseUrl + (prefix ?? "") + path;
    if (request.queryParameters) {
        const params = createQueryParameters(request.queryParameters);
        if (params.length > 0) {
            fullPath += params;
        }
    }
    return fullPath;
}

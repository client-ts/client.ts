import {Request} from "../../types/http";

export function encodeRequestBody(request: Request): string | ReadableStream<any> | FormData | ArrayBuffer | URLSearchParams | undefined {
    let encoder: (body: any) => string = request.encoder ?? JSON.stringify;
    return request.body ?
        (
            typeof request.body === "string" ||
            request.body instanceof ReadableStream ||
            request.body instanceof FormData ||
            request.body instanceof ArrayBuffer ||
            request.body instanceof URLSearchParams
        ) ? request.body : encoder(request.body) : undefined
}

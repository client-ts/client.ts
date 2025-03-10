import {Hook} from "../../types/hook";
import {Validator} from "../../types/validator";
import {Headers} from "../../types/builder";
import {createQueryParameters} from "../utils/http";
import {createResult} from "./result";
import {HttpMethods, Request} from "../../types/http";
import {executeValidators} from "./validator";
import {mergeObjects, withDefault} from "../utils/objects";
import {executeAfterRequestHooks} from "./hooks";
import {decodeResultBody} from "./decoder";
import {encodeRequestBody} from "./encoder";
import {createRequestPath} from "./request";

export async function executeRequest(prefix: string | undefined, request: Request, hooks: Hook[], validators: Validator[], additionalFetchOptions: any) {
    let method: string = withDefault(request.method, "GET");
    let encoder: (body: any) => string = withDefault(request.encoder, JSON.stringify);
    let decoder: (body: string) => any = withDefault(request.decoder, JSON.parse);
    const abortSignal =
        withDefault(request.abortSignal, (request.timeout ? AbortSignal.timeout(request.timeout) : undefined));

    let path: string = request.path;
    let headers: Headers | undefined = request.headers;

    const body = encodeRequestBody(request)
    const fullPath = createRequestPath(prefix, path, request);

    // Auto-apply the JSON Content-Type header if the body is an object.
    if (encoder === JSON.stringify && request.headers?.['Content-Type'] === undefined && body) {
        request = request.merge({
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    return fetch(
        fullPath,
        mergeObjects({method, body, headers, signal: abortSignal}, additionalFetchOptions)
    ).
    then(async (res) => {
        const result = await decodeResultBody(res, decoder);
        return createResult<any>({
            request: {
                url: fullPath,
                method: method as HttpMethods,
            },
            headers: res.headers,
            statusCode: res.status,
            data: result,
        })
    }).
    then((res) => {
        executeValidators(res, validators)
        res = executeAfterRequestHooks(request, res, hooks);
        return res
    });
}

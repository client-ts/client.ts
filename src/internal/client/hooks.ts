import {Hook} from "../../types/hook";
import {Request, Result} from "../../types/http";

export function executeBeforeRequestHooks(request: Request, hooks: Hook[]): Request {
    for (const hook of hooks) {
        if (hook.beforeRequest) {
            request = hook.beforeRequest(request);
        }
    }
    return request
}

export function executeAfterRequestHooks(request: Request, res: Result<any>, hooks: Hook[]): Result<any> {
    for (const hook of hooks) {
        if (hook.afterRequest) {
            res = hook.afterRequest(request, res);
        }
    }
    return res
}

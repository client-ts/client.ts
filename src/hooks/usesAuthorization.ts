import {Request} from "../types/http";
import {createHook} from "../builder/hook";

export const usesAuthorization = (token: string, header?: string) => createHook({
    beforeRequest: (request: Request) => {
        return request.merge({
            headers: {
                [header ?? 'Authorization']: token
            }
        })
    }
})

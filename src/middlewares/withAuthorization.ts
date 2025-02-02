import {Request} from "../types/http";
import {RequestConsumer} from "../types/client";

export const withAuthorization: RequestConsumer = (token: string, header?: string)=>
    ((request: Request): Request => {
        return {
            ...request,
            headers: {
                ...request.headers,
                [header ?? 'Authorization']: token
            }
        }
    })

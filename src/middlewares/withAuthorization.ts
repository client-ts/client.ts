import {Request} from "../types/http";
import {RequestConsumer} from "../types/client";

export const withAuthorization = (token: string, header?: string): RequestConsumer =>
    ((request: Request): Request => {
        return {
            ...request,
            headers: {
                ...request.headers,
                [header ?? 'Authorization']: token
            }
        }
    })

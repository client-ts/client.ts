import {Request} from "../types/builder";

export const withAuthorization = (token: string, header?: string)=>
    ((request: Request): Request => {
        return {
            ...request,
            headers: {
                ...request.headers,
                [header ?? 'Authorization']: token
            }
        }
    })

export type Connector = (path: string, init: RequestInit) => Promise<{
    text(): Promise<string>,
    json(): Promise<any>,
    headers: any,
    status: number
}>

export type Request = {
    baseUrl: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: any,
    headers?: {
        [key: string]: any
    }
    encoder?: (body: any) => string
    decoder?: (body: string) => any
}

export type Result<Type> = {
    headers: any,
    statusCode: number,
    result: Type | null
    decodeError?: any
}

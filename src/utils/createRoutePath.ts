import {HttpMethods, RoutePath} from "../types/http";

export const createRoutePath =
    (method: HttpMethods, path: string): RoutePath => `${method} ${path}` as const

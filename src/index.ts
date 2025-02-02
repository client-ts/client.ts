import { createClient as _createClient } from "./builder/createClient";
import {ClientBuilder, ClientBuilderOptions} from "./types/builder";
import {Client} from "./types/client";

export const createClient: <C extends ClientBuilder>(baseUrl: string, config: C, options?: ClientBuilderOptions) =>
    Client<C> = _createClient
export { createRoute, staticRoute, dynamicRoute, route } from "./builder/route";
export { withAuthorization } from "./middlewares/withAuthorization";
export type { Client };

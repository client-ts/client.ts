import {PureRoute, Request, WithConsumers} from "./builder";

export type RouteDef<Response, Args extends any[]> = {
    _constructor: (...args: Args) => string | PureRoute<Response>;
};

export type RequestConsumer = (request: Request) => Request;
export type Client<C extends ClientBuilder> = {
    [K in keyof C]: {
        [RK in keyof C[K]["routes"]]: C[K]["routes"][RK] extends RouteDef<infer Response, infer Args>
            ? (...args: Args) => Promise<Response>
            : never;
    }
} & WithConsumers

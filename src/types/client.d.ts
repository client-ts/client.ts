import {PureRoute} from "./builder";
import {Request, Result} from "./http";

export type RouteDef<Response, Args extends any[]> = {
    _constructor: (...args: Args) => string | PureRoute<Response>;
    _static: boolean;
};

export type RequestConsumer = (request: Request) => Request;
export type ResultConsumer = (request: Request, result: Result<any>) => Result<any>;
export type Client<C extends ClientBuilder> = {
    [K in keyof C]: {
        [RK in keyof C[K]["routes"]]: C[K]["routes"][RK] extends RouteDef<infer Response, infer Args>
            ? (...args: Args) => Promise<Result<Response>>
            : never;
    }
}

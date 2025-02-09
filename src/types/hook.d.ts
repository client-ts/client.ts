import {RequestConsumer, ResultConsumer} from "./client";

export type Hook = {
    beforeRequest?: RequestConsumer,
    afterRequest?: ResultConsumer
}

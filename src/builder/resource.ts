import {Resource} from "../types/builder";

export const createResource =
    <R extends Resource>(resource: R): R => resource

import {Result} from "./http";

export type ValidatorRejected = {
    cause?: any
}
export type ValidatorReject = (cause: any) => ValidatorRejected;
export type ValidatorAction = (res: Result<any>, reject: ValidatorReject) => void | undefined | ValidatorRejected;
export type Validator = {
    name: string,
    validate: ValidatorAction;
}

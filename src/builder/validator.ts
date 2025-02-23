import {Validator, ValidatorAction} from "../types/validator";

export const createUnnamedValidator = (validate: ValidatorAction): Validator => {
    return createValidator(`[unnamed validator]`, validate)
}

export const createValidator = (name: string,  validate: ValidatorAction): Validator => {
    return {name, validate};
}

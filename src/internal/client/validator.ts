import {Validator, ValidatorReject, ValidatorRejected} from "../../types/validator";
import {Result} from "../../types/http";

export const $$validationReject: ValidatorReject = (cause: any): ValidatorRejected => ({cause})

export function executeValidators(result: Result<any>, validators: Validator[]) {
    for (const validator of validators) {
        const validation = validator.validate(result, $$validationReject);
        if (validation && validation.cause) {
            throw {
                validator: validator.name,
                message: `Validation failed by ${validator.name}`,
                cause: validation.cause
            };
        }
    }
}

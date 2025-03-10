import {BaseResult, Result} from "../../types/http";
import {mergeObjects} from "../utils/objects";

export function createResult<Type>(base: BaseResult<Type>): Result<Type> {
    return {
        ...base,
        merge(result: Partial<Result<Type>>): Result<Type> {
            const newResult = mergeObjects(this, result)
            if (result.headers) {
                newResult.headers = mergeObjects(this.headers, result.headers)
            }
            return newResult
        },
        when<T>(predicate: boolean, callback: (result: Result<Type>) => T | null): T | null {
            if (predicate) {
                return callback(this)
            }
            return null
        },
        whenStatusCode<T>(statusCode: number, callback: (result: Result<Type>) => T): T | null {
            return this.when(this.statusCode === statusCode, () => callback(this))
        },
        whenHasBody<T>(callback: (body: Type) => T): T | null {
            return this.when(this.data !== null, () => callback(this.data!))
        },
        whenOk<T>(callback: (result: Result<Type>, data: Type) => T): T | null {
            return this.when(
                this.statusCode >= 200 && this.statusCode <= 299 && this.data !== null,
                () => callback(this, this.data!)
            )
        }
    }
}

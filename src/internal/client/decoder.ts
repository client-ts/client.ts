import {Decoder} from "../../types/builder";

export async function decodeResultBody(res: Response, decoder: Decoder<any>): Promise<any> {
    let result: any = null;
    try {
        result = decoder === JSON.parse ?
            await res.json() :
            await res.text().then(decoder)
    } catch (e) {
        throw e
    }
    return result;
}

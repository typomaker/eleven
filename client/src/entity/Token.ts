import { sign } from "crypto";

export class Token {
    value: string;

    constructor(p: Token.Configuration) {
        this.value = p.value;
    }

    static api(host: string){
        return {
            // prototype: this,
            sign: async () => {
            }
        }
    }
}
export namespace Token {
    export type Configuration = Required<Token>
}

export default Token;
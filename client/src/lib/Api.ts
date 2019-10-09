import * as entity from './../entity';
import queryString from 'query-string'
class Api {
    constructor(
        private host: string, private authorization?: string
    ) {

    }

    async autentificate(q: {
        type: 'facebook';
        token: string;
    } | {
        type: 'internal';
        email: string;
        password: string;
        token: string;
    }) {
        const response = await fetch(`${this.host}/v1/token`, {
            method: 'POST',
            body: JSON.stringify(q),
        });
        await Api.assert(response);
        const json = await response.json();
        const token = new entity.Token(json);
        this.authorization = token.value;

        return token;
    }

    get account() {
        return new Api.Account();
    }
}
namespace Api {
    export async function assert(r: Response): Promise<void> {
        if (r.ok) {
            return
        }
        if (r.headers.get('Content-Type') === 'application/json') {
            const json = await r.json()
            throw new Api.Error(r.status, json.code, new Date(json.date));
        }
        throw r;
    }
    export type Token = {
        value: string
    }
    export class Error {
        constructor(
            readonly status: number,
            readonly code: number,
            readonly date: Date
        ) { }
    }
    export class Account {

    }
}
export default Api

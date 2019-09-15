export interface Profile {
    name: string
    email?: string
    avatar?: string
    user: User
}
export interface Session {
    uuid: string
    expiredAt: string
    profile?: Profile
}
export interface User {
    uuid: string
    name: string
}
export class Api {
    authorization?: string;
    readonly session = Object.freeze({
        async get() {

        },
        async create(data: {
            email: Required<Profile['email']>;
            password: string;
            recaptcha: string;
        }): Promise<Session> {
            const response = await fetch(`${this.host}/session`, { method: 'POST', headers: this.headers, body: JSON.stringify(data) });
            return await response.json();
        }
    })


    constructor(readonly host: string) {
    }

    private get headers() {
        const headers = new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        });

        if (this.authorization) {
            headers.set('Authorization', `Bearer: ${this.authorization}`)
        }

        return headers;
    }
}


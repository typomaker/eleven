import Session from "./Session";
import Profile from "./Profile";

export default class Api {
    authorization?: string;
    readonly user = Object.freeze({
        async get(id: string): Promise<Profile> {
            const response = await fetch(`${this.host}/profile/${id}`, { method: 'GET', headers: this.headers });
            return await response.json();
        }
    })
    readonly session = Object.freeze({
        async get(token: string): Promise<Session> {
            const response = await fetch(`${this.host}/session/${token}`, { method: 'GET', headers: this.headers });
            return await response.json();
        },
        async create(data: {
            email: string;
            password: string;
            recaptcha: string;
        }): Promise<Session> {
            const response = await fetch(`${this.host}/session`, { method: 'POST', headers: this.headers, body: JSON.stringify(data) });
            return await response.json();
        },
        async delete(token: string): Promise<Session> {
            const response = await fetch(`${this.host}/session/${token}`, { method: 'DELETE', headers: this.headers });
            return await response.json();
        },
        async update(token: string): Promise<Session> {
            const response = await fetch(`${this.host}/session/${token}`, { method: 'PUT', headers: this.headers });
            return await response.json();
        },
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
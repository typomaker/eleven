import uuid from 'uuid/v4';
import pg from 'pg';
import validator from "validator";
import Cache from 'node-cache'
import bcrypt from 'bcrypt';

class Account {
    id: string;
    created: Date;
    deleted: Date | null;
    name: string;
    avatar: string | null;
    emails: Account.Email.List;
    signs: Account.Sign.List;
    tokens: Account.Token.List;

    constructor(p: Account.Configuration) {
        this.id = p.id || uuid();
        this.created = p.created || new Date;
        this.deleted = p.deleted || null;
        this.name = p.name || '';
        this.avatar = p.avatar || null;
        this.emails = p.emails || new Account.Email.List();
        this.signs = p.signs || new Account.Sign.List();
        this.tokens = p.tokens || new Account.Token.List();
    }
}
namespace Account {
    export type Configuration = Partial<Account>
    export class List extends Array<Account> {
        public first(): Account | null {
            return this[0] || null;
        }
    }
    export class Sign {
        readonly id: Sign.Id
        readonly created: Date;

        constructor(p: Sign.Configuration) {
            this.id = p.id;
            this.created = p.created || new Date;
        }
    }
    export namespace Sign {
        export type Method = 'facebook' | 'internal';
        export namespace Method {
            export function is(v: Method | any): v is Method {
                return validator.isIn(v, ['facebook', 'internal']);
            }
        }
        export type Configuration = Partial<Sign> & Omit<Sign, 'created'> & Pick<Sign, 'id'>
        export class Id {
            readonly method: Method;
            readonly key: string;
        }

        export class List extends Array<Sign> {
            includes(s: Sign.Id): boolean;
            includes(searchElement: Sign, fromIndex?: number): boolean;
            includes(s: Sign | Sign.Id, fromIndex?: number): boolean {
                if (Account.Sign.Id.is(s)) {
                    return !!super.filter(v => v.id.key === s.key && v.id.method === s.method).length
                }
                return super.includes(s, fromIndex);
            }
            filter<S extends Sign>(callbackfn: (value: Sign, index: number, array: Sign[]) => value is S, thisArg?: any): S[];
            filter(callbackfn: (value: Sign, index: number, array: Sign[]) => unknown, thisArg?: any): List;
            filter(method: Sign.Method): List;
            filter(...args: any) {
                if (Account.Sign.Method.is(args[0])) {
                    return super.filter((sign) => sign.id.method === args[0]);
                }

                return super.filter(args[0], args[1]);
            }
        }
        export namespace Id {
            export function is(value: Id | any): value is Id {
                return value instanceof Object
                    && value.method !== undefined && value.key !== undefined
                    && typeof value.method === 'string'
                    && typeof value.key === 'string'
                    && Account.Sign.Method.is(value.method)
                    && value.key !== '';
            }
        }
    }
    export class Email {
        readonly id: string;
        readonly created: Date;
        address: Email.Address;

        constructor(p: Email.Configuration) {
            if (!Email.Address.is(p.address)) {
                throw new Error(`Invalid argument. Address '${p.address}' is not valid.`);
            }
            this.id = p.id || uuid();
            this.address = p.address;
            this.created = p.created || new Date;
        }
    }
    export namespace Email {
        export type Configuration = Partial<Email> & Pick<Email, 'address'>
        export type Address = string;
        export namespace Address {
            export function is(value: any): value is Address {
                return validator.isEmail(value)
            }
        }
        export class List extends Array<Email> {
            includes(s: Address): boolean;
            includes(searchElement: Email, fromIndex?: number): boolean;
            includes(s: Email | Address, fromIndex?: number): boolean {
                if (Email.Address.is(s)) {
                    return !!super.filter(v => v.address === s).length
                }
                return super.includes(s, fromIndex);
            }
        }
    }
    export class Token {
        id: string;
        created: Date;
        updated: Date;
        deleted: Date | null;
        ip: string | null;

        constructor(p?: Token.Configuration) {
            if (p) {
                this.id = p.id || uuid();
                this.created = p.created || new Date;
                this.updated = p.updated || new Date;
                this.deleted = p.deleted || null;
                this.ip = p.ip || null;
            }
        }
    }
    export namespace Token {
        export type Configuration = Partial<Token>;

        export class List extends Array<Token>{

        }
    }

    export function storage(pg: pg.ClientBase) {
        return new class Storage {
            public async save(...accounts: Array<Account>) {
                await pg.query(
                    `
                    INSERT INTO account.user 
                    (id, created, name, avatar, deleted) 
                    VALUES 
                    ${
                    accounts.map((v) => `(
                                ${pg.escapeLiteral(v.id)},
                                ${pg.escapeLiteral(v.created.toISOString())},
                                ${pg.escapeLiteral(v.name)},
                                ${v.avatar ? pg.escapeLiteral(v.avatar) : null},
                                ${v.deleted ? pg.escapeLiteral(v.deleted.toISOString()) : null}
                        )`).join(',')
                    }
                    ON CONFLICT(id) 
                    DO UPDATE SET 
                        name=EXCLUDED.name, 
                        avatar=EXCLUDED.avatar, 
                        deleted=EXCLUDED.deleted
                    `
                )
                let emails = [];
                let signs = [];
                let tokens = [];
                for (const account of accounts) {
                    for (const v of account.emails) {
                        emails.push(
                            `(
                                ${pg.escapeLiteral(v.id)},
                                ${pg.escapeLiteral(account.id)},
                                ${pg.escapeLiteral(v.address)},
                                ${pg.escapeLiteral(v.created.toISOString())}
                            )`
                        );
                    }
                    for (const v of account.signs) {
                        signs.push(
                            `(
                                ${pg.escapeLiteral(account.id)},
                                ${pg.escapeLiteral(v.id.method)},
                                ${pg.escapeLiteral(v.id.key)},
                                ${pg.escapeLiteral(v.created.toISOString())}
                            )`
                        );
                    }
                    for (const v of account.tokens) {
                        tokens.push(
                            `(
                                ${pg.escapeLiteral(account.id)},
                                ${pg.escapeLiteral(v.id)},
                                ${pg.escapeLiteral(v.created.toISOString())},
                                ${pg.escapeLiteral(v.updated.toISOString())},
                                ${v.deleted ? pg.escapeLiteral(v.deleted.toISOString()) : 'null'},
                                ${v.ip ? pg.escapeLiteral(v.ip) : 'null'}
                            )`
                        );
                    }
                }

                await pg.query(
                    `
                    INSERT INTO account.email (id,owner,address,created)
                    VALUES
                    ${emails.join(',')}
                    ON CONFLICT(id)
                    DO UPDATE SET
                        address = EXCLUDED.address
                        WHERE account.email.owner=EXCLUDED.owner
                    `
                );
                await pg.query(
                    `
                    INSERT INTO account.sign (owner,method,key,created)
                    VALUES
                    ${signs.join(',')}
                    ON CONFLICT(method, key)
                    DO NOTHING
                    `
                );
                await pg.query(
                    `
                    INSERT INTO account.token (id,created,updated,deleted,ip)
                    VALUES
                    ${tokens.join(',')}
                    ON CONFLICT(id)
                    DO UPDATE SET 
                        updated = EXCLUDED.updated,
                        deleted = EXCLUDED.deleted
                        WHERE account.token.owner=EXCLUDED.owner
                    `
                );
            }

            public find() {
                return new class Finder {
                    private _id: Array<Account['id']> = [];
                    private _email: Array<Account.Email['address']> = [];
                    private _sign: Array<Account.Sign['id']> = [];

                    public id(...v: Array<Account['id']>): this {
                        this._id = v;
                        return this;
                    }

                    public email(...v: Finder['_email']): this {
                        this._email = v
                        return this
                    }

                    public sign(...v: Finder['_sign']): this {
                        this._sign = v
                        return this
                    }
                    public async read(): Promise<Account.List> {
                        let sql = ['SELECT * FROM account.user'];
                        {
                            let where = [];
                            if (this.id && this._id.length > 0) {
                                const ph = this._id
                                    .map(v => pg.escapeLiteral(v))
                                    .join(',');
                                where.push(`account.user.id IN (${ph})`);
                            }
                            if (this._email.length > 0) {
                                const ph = this._email
                                    .map(v => pg.escapeLiteral(v))
                                    .join(',');
                                where.push(
                                    `account.user.id IN (
                                SELECT account.email.owner 
                                FROM account.email 
                                WHERE account.email.address IN (${ph})
                            )`
                                );
                            }
                            if (this._sign.length > 0) {
                                const ph = this._sign
                                    .map((v) => `(${pg.escapeLiteral(v.method)},${pg.escapeLiteral(v.key)})`)
                                    .join(',');
                                where.push(
                                    `account.user.id IN(
                                SELECT account.sign.owner 
                                FROM account.sign 
                                WHERE (account.sign.method, account.sign.key) IN (${ph})
                            )`
                                );
                            }
                            if (where.length) {
                                sql.push('WHERE ' + where.join(' AND '));
                            }
                        }

                        const result = await pg.query(sql.join(' '));
                        if (result.rowCount === 0) {
                            return new Account.List;
                        }
                        const ph = result.rows
                            .map(v => pg.escapeLiteral(v.id))
                            .join(',');
                        let emails: Map<number, Account.Email.List> = new Map();
                        let signs: Map<number, Account.Sign.List> = new Map();
                        let tokens: Map<number, Account.Token.List> = new Map();
                        {
                            const result = await pg.query(`SELECT * FROM account.email WHERE account.email.owner IN (${ph}) ORDER BY account.email.created`);
                            for (const row of result.rows) {
                                const email = new Account.Email({
                                    id: row.id,
                                    address: row.address,
                                    created: new Date(row.created),
                                });
                                if (emails.has(row.owner)) {
                                    emails.get(row.owner)!.push(email);
                                } else {
                                    emails.set(row.owner, new Account.Email.List(email));
                                }
                            }
                        }
                        {
                            const result = await pg.query(`SELECT * FROM account.sign WHERE account.sign.owner IN (${ph}) ORDER BY account.sign.created`);
                            for (const row of result.rows) {
                                const sign = new Account.Sign({
                                    id: { method: row.method, key: row.key },
                                    created: new Date(row.created),
                                });
                                if (signs.has(row.owner)) {
                                    signs.get(row.owner)!.push(sign);
                                } else {
                                    signs.set(row.owner, new Account.Sign.List(sign));
                                }
                            }
                        }
                        {
                            const result = await pg.query(`SELECT * FROM account.token WHERE account.token.owner IN (${ph}) ORDER BY account.token.created`);
                            for (const row of result.rows) {
                                const token = new Account.Token({
                                    deleted: row.deleted ? new Date(row.deleted) : null,
                                    created: new Date(row.created),
                                    updated: new Date(row.updated),
                                    ip: row.ip || null,
                                    id: row.id,
                                });
                                if (tokens.has(row.owner)) {
                                    tokens.get(row.owner)!.push(token);
                                } else {
                                    tokens.set(row.owner, new Account.Token.List(token));
                                }
                            }
                        }
                        return new Account.List(...result.rows.map(row => new Account({
                            avatar: row.avatar,
                            name: row.name,
                            id: row.id,
                            deleted: row.deleted ? new Date(row.deleted) : null,
                            created: new Date(row.created),
                            emails: emails.get(row.id),
                            signs: signs.get(row.id),
                            tokens: tokens.get(row.id),
                        })));
                    }
                }
            }
        }
    }
}

export default Account;

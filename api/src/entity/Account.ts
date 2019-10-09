import uuid from 'uuid/v4';
import pg from 'pg';
import validator from "validator";

class Account {
    id: string;
    created: Date;
    deleted: Date | null;
    name: string;
    avatar: string | null;
    emails: Account.Email.List;
    signs: Account.Sign.List;

    constructor(p: Account.Configuration) {
        this.id = p.id || uuid();
        this.created = p.created || new Date;
        this.deleted = p.deleted || null;
        this.name = p.name || '';
        this.avatar = p.avatar || null;
        this.emails = p.emails || new Account.Email.List();
        this.signs = p.signs || new Account.Sign.List();
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
            readonly value: string;
        }

        export class List extends Array<Sign> {
            includes(s: Sign.Id): boolean;
            includes(searchElement: Sign, fromIndex?: number): boolean;
            includes(s: Sign | Sign.Id, fromIndex?: number): boolean {
                if (Account.Sign.Id.is(s)) {
                    return !!super.filter(v => v.id.value === s.value && v.id.method === s.method).length
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
            export function is(v: Id | any): v is Id {
                return v instanceof Object
                    && v.method !== undefined && v.value !== undefined
                    && typeof v.method === 'string'
                    && typeof v.value === 'string'
                    && Account.Sign.Method.is(v.method)
                    && v.value !== '';
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

    export class Storage {
        constructor(private client: pg.ClientBase) {
        }
        private filter(f: Storage.Filter): string {
            switch (f[0]) {
                case '=': {
                    switch (f[1]) {
                        case 'id': {
                            if (!(f[2] instanceof Array)) f[2] = [f[2]];
                            return `id IN(${f[2].map(this.client.escapeLiteral).join(',')})`;
                        }
                        case 'email': {
                            if (!(f[2] instanceof Array)) f[2] = [f[2]];
                            const ph = f[2].map(this.client.escapeLiteral).join(',');
                            return `id IN(SELECT owner FROM account.email WHERE address IN(${ph}))`;
                        }
                        case 'sign': {
                            if (!(f[2] instanceof Array)) f[2] = [f[2]];
                            const m = (v: Account.Sign.Id) => `(${this.client.escapeLiteral(v.method)},${this.client.escapeLiteral(v.value)})`;
                            const ph = f[2].map(m).join(',');
                            return `id IN(SELECT owner FROM account.sign WHERE (method, value) IN (${ph}))`;
                        }
                        case 'token': {
                            if (!(f[2] instanceof Array)) f[2] = [f[2]];
                            const ph = f[2].map(value => this.client.escapeLiteral(value)).join(',');
                            return `id IN(SELECT owner FROM account.token WHERE id IN (${ph}))`;
                        }
                    }
                }  
                case '&&': {
                    return f[1].map(v => `(${this.filter(v)})`).join(' AND ');
                }
                case '||': {
                    return f[1].map(v => `(${this.filter(v)})`).join(' OR ');
                }
            }
        }
        public async read(condition?: { filter?: Storage.Filter, limit?: number, skip?: number }): Promise<Account.List> {
            let sql = ['SELECT * FROM account.user'];
            if (condition) {
                if (condition.filter) sql.push('WHERE ' + this.filter(condition.filter));
                if (condition.limit) sql.push('LIMIT ' + condition.limit);
                if (condition.skip) sql.push('OFFSET ' + condition.skip);
            }

            const result = await this.client.query(sql.join(' '));
            if (result.rowCount === 0) {
                return new Account.List;
            }
            const ph = result.rows
                .map(v => this.client.escapeLiteral(v.id))
                .join(',');
            let emails: Map<string, Account.Email.List> = new Map();
            let signs: Map<string, Account.Sign.List> = new Map();
            {
                const result = await this.client.query(`SELECT * FROM account.email WHERE owner IN (${ph}) ORDER BY created`);
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
                const result = await this.client.query(`SELECT * FROM account.sign WHERE owner IN (${ph}) ORDER BY created`);
                for (const row of result.rows) {
                    const sign = new Account.Sign({
                        id: { method: row.method, value: row.value },
                        created: new Date(row.created),
                    });
                    if (signs.has(row.owner)) {
                        signs.get(row.owner)!.push(sign);
                    } else {
                        signs.set(row.owner, new Account.Sign.List(sign));
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
            })));
        }
        public async save(...accounts: Array<Account>) {
            await this.client.query(
                `
                INSERT INTO account.user 
                (id, created, name, avatar, deleted) 
                VALUES 
                ${
                accounts.map((v) => `(
                    ${this.client.escapeLiteral(v.id)},
                    ${this.client.escapeLiteral(v.created.toISOString())},
                    ${this.client.escapeLiteral(v.name)},
                    ${v.avatar ? this.client.escapeLiteral(v.avatar) : 'NULL'},
                    ${v.deleted ? this.client.escapeLiteral(v.deleted.toISOString()) : 'NULL'}
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
            for (const account of accounts) {
                for (const v of account.emails) {
                    emails.push(
                        `(
                            ${this.client.escapeLiteral(v.id)},
                            ${this.client.escapeLiteral(account.id)},
                            ${this.client.escapeLiteral(v.address)},
                            ${this.client.escapeLiteral(v.created.toISOString())}
                        )`
                    );
                }
                for (const v of account.signs) {
                    signs.push(
                        `(
                            ${this.client.escapeLiteral(account.id)},
                            ${this.client.escapeLiteral(v.id.method)},
                            ${this.client.escapeLiteral(v.id.value)},
                            ${this.client.escapeLiteral(v.created.toISOString())}
                        )`
                    );
                }
            }
            if (emails.length) {
                const query = `
                    INSERT INTO account.email (id,owner,address,created)
                    VALUES
                    ${emails.join(',')}
                    ON CONFLICT(id)
                    DO UPDATE SET
                        address = EXCLUDED.address
                        WHERE account.email.owner=EXCLUDED.owner
                    `
                await this.client.query(query);
            }
            if (signs.length) {
                const query = `
                    INSERT INTO account.sign (owner,method,value,created)
                    VALUES
                    ${signs.join(',')}
                    ON CONFLICT(method, value)
                    DO NOTHING
                    `
                await this.client.query(query);
            }
        }
    }
    export namespace Storage {
        export type Filter =
            { 0: '||' | '&&', 1: Array<Filter> }
            | ['=', 'id', string | Array<string>]
            | ['=', 'email', string | Array<string>]
            | ['=', 'sign', Account.Sign.Id | Array<Account.Sign.Id>]
            | ['=', 'token', string | Array<string>]
            ;
    }
}

export default Account;

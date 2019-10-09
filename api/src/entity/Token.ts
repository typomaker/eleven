import Account from './Account';
import uuid from 'uuid/v4';
import pg from 'pg';
export class Token {
    id: string;
    created: Date;
    updated: Date;
    deleted: Date | null;
    ip: string | null;
    account: Account;

    constructor(p: Token.Property) {
        this.account = p.account;
        this.id = p.id || uuid();
        this.created = p.created || new Date;
        this.updated = p.updated || new Date;
        this.deleted = p.deleted || null;
        this.ip = p.ip || null;
    }

    get isDeleted(): boolean {
        if (!this.deleted) return false;
        return this.deleted <= new Date();
    }
}
export namespace Token {
    export type Property = Partial<Token> & Required<Pick<Token, 'account'>>;

    export class List extends Array<Token>{
        first(): Token | null {
            return this[0] || null
        }
    }

    export class Storage {
        constructor(private client: pg.ClientBase) {
        }
        public async update(dataset: Pick<Partial<Token>, 'deleted'>, constraint?: { filter?: Storage.Filter }): Promise<Token.List> {
            const sql = ['UPDATE account.token SET'];
            const set: string[] = [];
            if (dataset.deleted !== undefined) {
                let v = ''
                if (dataset.deleted === null) {
                    v = 'NULL'
                } else {
                    v = this.client.escapeLiteral(dataset.deleted.toISOString());
                }
                set.push(`deleted = ${v}`);
            }
            if (set.length === 0) return new Token.List;
            set.push(`updated = ${new Date().toISOString()}`);
            sql.push(set.join(','));
            if (constraint) {
                if (constraint.filter) sql.push('WHERE ' + this.filter(constraint.filter));
            }
            sql.push('RETURNING *');
            const result = await this.client.query(sql.join(' '));
            if (result.rowCount === 0) {
                return new Token.List;
            }
            return await this.result(result);
        }
        public async delete(filter?: Storage.Filter): Promise<Token.List> {
            const sql = ['DELETE FROM account.token'];
            if (filter) {
                sql.push('WHERE ' + this.filter(filter));
            }
            sql.push('RETURNING *');
            const result = await this.client.query(sql.join(' '));
            if (result.rowCount === 0) {
                return new Token.List;
            }
            return await this.result(result);
        }
        public async read(constraint?: { filter?: Storage.Filter, limit?: number, skip?: number }): Promise<Token.List> {
            let sql = ['SELECT * FROM account.token'];
            if (constraint) {
                if (constraint.filter) sql.push('WHERE ' + this.filter(constraint.filter));
                if (constraint.limit) sql.push('LIMIT ' + constraint.limit);
                if (constraint.skip) sql.push('OFFSET ' + constraint.skip);
            }

            const result = await this.client.query(sql.join(' '));
            if (result.rowCount === 0) {
                return new Token.List;
            }
            return await this.result(result);
        }
        private async result(result: pg.QueryResult): Promise<Token.List> {
            const accountsID = result.rows.map<string>(v => v.owner)

            const accountsMap = new Map<string, Account>();
            {
                const storage = new Account.Storage(this.client);
                for (const account of await storage.read({ filter: ['=', 'id', accountsID] })) {
                    accountsMap.set(account.id, account);
                }
            }

            return new Token.List(...result.rows.map(row => new Token({
                id: row.id,
                created: new Date(row.created),
                updated: new Date(row.updated),
                deleted: row.deleted ? new Date(row.deleted) : null,
                account: accountsMap.get(row.owner)!,
                ip: row.ip,
            })));
        }
        private filter(f: Storage.Filter): string {
            switch (f[0]) {
                case '&&':
                    return f[1].map(v => `(${this.filter(v)})`).join(' AND ');
                case '||':
                    return f[1].map(v => `(${this.filter(v)})`).join(' OR ');
                case "=":
                    switch (f[1]) {
                        case 'account':
                            if (!(f[2] instanceof Array)) f[2] = [f[2]];
                            return `owner IN(${f[2].map(this.client.escapeLiteral).join(',')})`;
                        case 'id':
                            if (!(f[2] instanceof Array)) f[2] = [f[2]];
                            return `id IN(${f[2].map(this.client.escapeLiteral).join(',')})`;
                    }
                case 'isDeleted':
                    if (f[1]) return `deleted NOT NULL AND deleted <= NOW()`;
                    return `deleted IS NULL`;
            }
        }
        public async save(...tokens: Array<Token>) {
            await new Account.Storage(this.client).save(...tokens.map(token => token.account));
            await this.client.query(
                `
                INSERT INTO account.token 
                (id, created, updated, deleted, ip, owner) 
                VALUES 
                ${
                tokens.map((v) => `(
                    ${this.client.escapeLiteral(v.id)},
                    ${this.client.escapeLiteral(v.created.toISOString())},
                    ${this.client.escapeLiteral(v.updated.toISOString())},
                    ${v.deleted ? this.client.escapeLiteral(v.deleted.toISOString()) : 'NULL'},
                    ${v.ip ? this.client.escapeLiteral(v.ip) : 'NULL'},
                    ${this.client.escapeLiteral(v.account.id)}
                )`).join(',')
                }
                ON CONFLICT(id) 
                DO UPDATE SET 
                    updated=EXCLUDED.updated, 
                    deleted=EXCLUDED.deleted
                `
            );
        }
    }
    export namespace Storage {
        export type Filter =
            | ['=', 'id', string | Array<string>]
            | ['=', 'account', string | Array<string>]
            | ['isDeleted', boolean]
            | { 0: '||' | '&&', 1: Array<Filter> }
            ;
    }
}

export default Token
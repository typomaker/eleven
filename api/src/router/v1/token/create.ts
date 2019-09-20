import Koa from "koa";
import { Account } from "../../../entity";
import axios from 'axios';
import pg from 'pg';
import Recaptcha2 from 'recaptcha2';
import bcrypt from 'bcrypt';

async function create<CustomT extends create.Context>(ctx: Koa.ParameterizedContext<{}, CustomT>) {
    const payload: create.Payload = ctx.request.body;
    switch (payload.type) {
        case "internal":
            await create.internal(ctx);
            return;
        case "facebook":
            await create.facebook(ctx);
            return;
        default:
            ctx.throw(400);
    }
}
namespace create {
    export type Context = facebook.Context & internal.Context;
    export type Payload = facebook.Payload | internal.Payload;
    export type Result = {
        value: string,
    }

    export async function internal<CustomT extends internal.Context>(ctx: Koa.ParameterizedContext<{}, CustomT>) {
        const payload: internal.Payload = ctx.request.body;
        if (!internal.Payload.is(payload) || !ctx.recaptcha2.validate(payload.token)) {
            ctx.throw(400);
        }
        const conn = await ctx.postgres.connect();
        try {
            await conn.query('BEGIN');
            let user = (await Account.storage(conn).find().email(payload.email).read()).first();

            if (!user) {
                user = new Account({
                    name: payload.email.split('@')[0],
                    emails: new Account.Email.List(
                        new Account.Email({ address: payload.email })
                    ),
                    signs: new Account.Sign.List(
                        new Account.Sign({
                            id: {
                                method: 'internal',
                                key: bcrypt.hashSync(payload.password, 21),
                            }
                        })
                    )
                });
            } else {
                const sign = user.signs.filter('internal')[0] || null;
                if (!sign || !bcrypt.compareSync(payload.password, sign.id.key)) {
                    throw { status: 400 };
                }
            }

            const token = new Account.Token();
            user.tokens.push(token);
            await Account.storage(conn).save(user);

            await conn.query('COMMIT');
            ctx.body = <Result>{
                value: token.id,
            }
        } catch (e) {
            await conn.query('ROLLBACK');
            throw e;
        } finally {
            conn.release();
        }

    }
    export namespace internal {
        export type Context = {
            postgres: pg.Pool;
            recaptcha2: Recaptcha2;
        }
        export type Payload = {
            type: 'internal';
            email: string;
            password: string;
            token: string;
        }
        export namespace Payload {
            export function is(v: any): v is Payload {
                return v.type
                    && v.type === 'internal'
                    && v.email
                    && validator.isEmail(v.email)
                    && v.token
                    && v.token !== '';
            }
        }
    }
    export async function facebook<CustomT extends (facebook.Context)>(ctx: Koa.ParameterizedContext<{}, CustomT>) {
        const request: facebook.Payload = ctx.request.body;
        if (!facebook.Payload.is(request)) {
            ctx.throw(400);
            return;
        }
        const fb = {
            id: '',
            email: '',
            name: '',
        };
        try {
            const res = await axios.get(`https://graph.facebook.com/v4.0/me`, {
                params: {
                    "fields": "id,email,name",
                    "access_token": request.token,
                }
            });
            fb.email = res.data.email;
            fb.name = res.data.name;
            fb.id = res.data.id;
        } catch (err) {
            ctx.throw(400);
        }
        const conn = await ctx.postgres.connect();

        const id: Account.Sign.Id = { method: 'facebook', key: fb.id };
        
        try {
            await conn.query('BEGIN');
            let user = (await Account.storage(conn).find().sign(id).read()).first()
                || (await Account.storage(conn).find().email(fb.email).read()).first();

            if (!user) {
                user = new Account({
                    name: fb.name || fb.email.split('@')[0],
                    emails: new Account.Email.List(new Account.Email({ address: fb.email })),
                    signs: new Account.Sign.List(new Account.Sign({ id: id })),
                });
            } else {
                if (!user.signs.includes(id)) {
                    user.signs.push(new Account.Sign({ id: id }));
                }
                if (!user.emails.includes(fb.email)) {
                    user.emails.push(new Account.Email({ address: fb.email }));
                }
            }
            const token = new Account.Token();
            user.tokens.push(token);
            await Account.storage(conn).save(user);
            await conn.query('COMMIT');
            ctx.body = <Result>{
                value: token.id,
            };
        } catch (e) {
            await conn.query('ROLLBACK');
            throw e;
        } finally {
            conn.release();
        }
    }
    export namespace facebook {
        export type Context = {
            postgres: pg.Pool;
        }
        export type Payload = {
            type: 'facebook';
            token: string;
        }
        export namespace Payload {
            export function is(v: any): v is Payload {
                return v.type && v.token && v.type === 'facebook' && v.token !== '';
            }
        }
    }
}
export default create;
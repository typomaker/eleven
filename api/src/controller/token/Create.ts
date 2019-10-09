import Controller from '../Controller';
import * as entity from "../../entity";
import axios from 'axios';
import pg from 'pg';
import Recaptcha2 from 'recaptcha2';
import bcrypt from 'bcrypt';

namespace internal {
    export type Parameter = {
        type: 'internal';
        email: string;
        password: string;
        token: string;
        ip: string;
    }
    export namespace Params {
        export function is(v: any): v is Parameter {
            return v.type
                && v.type === 'internal'
                && v.email
                && validator.isEmail(v.email)
                && v.token
                && v.token !== '';
        }
    }
}
namespace facebook {
    export type Parameter = {
        type: 'facebook';
        token: string;
        ip: string;
    }
    export namespace Params {
        export function is(v: any): v is Parameter {
            return v.type && v.token && v.type === 'facebook' && v.token !== '';
        }
    }
}
class Create extends Controller<Create.Parameter, Promise<entity.Token>> {
    constructor(
        private postgres: pg.ClientBase,
        private recaptcha2: Recaptcha2,
    ) {
        super();
    }
    public async run(params: Create.Parameter): Promise<entity.Token> {
        switch (params.type) {
            case "internal":
                return await this.internal(params);
            case "facebook":
                return await this.facebook(params);
            default:
                throw new Error(Create.Error.BadPayload);
        }
    }
    private async internal(params: internal.Parameter): Promise<entity.Token> {
        if (!internal.Params.is(params) || !this.recaptcha2.validate(params.token)) {
            throw new Error(Create.Error.BadPayload);
        }
        let account = (
            await new entity.Account.Storage(this.postgres).read({
                filter: ['=', 'email', params.email]
            })
        ).first();

        if (!account) {
            account = new entity.Account({
                name: params.email.split('@')[0],
                emails: new entity.Account.Email.List(
                    new entity.Account.Email({ address: params.email })
                ),
                signs: new entity.Account.Sign.List(
                    new entity.Account.Sign({
                        id: {
                            method: 'internal',
                            value: bcrypt.hashSync(params.password, 21),
                        }
                    })
                )
            });
        } else {
            const sign = account.signs.filter('internal')[0] || null;
            if (!sign || !bcrypt.compareSync(params.password, sign.id.value)) {
                throw new Error(Create.Error.BadPayload);
            }
        }

        const token = new entity.Token({ account });
        await new entity.Token.Storage(this.postgres).save(token);
        return token
    }
    private async facebook(params: facebook.Parameter): Promise<entity.Token> {
        if (!facebook.Params.is(params)) {
            throw new Error(Create.Error.BadPayload);
        }
        const fb = await axios.get(`https://graph.facebook.com/v4.0/me`, {
            params: {
                "fields": "id,email,name",
                "access_token": params.token,
            }
        });

        const id: entity.Account.Sign.Id = { method: 'facebook', value: fb.data.id };

        let account = (
            await new entity.Account.Storage(this.postgres).read({
                filter: ['||', [['=', 'sign', id], ['=', 'email', fb.data.email]]]
            })
        ).first();

        if (!account) {
            account = new entity.Account({
                name: fb.data.name || fb.data.email.split('@')[0],
                emails: new entity.Account.Email.List(new entity.Account.Email({ address: fb.data.email })),
                signs: new entity.Account.Sign.List(new entity.Account.Sign({ id: id })),
            });
        } else {
            if (!account.signs.includes(id)) {
                account.signs.push(new entity.Account.Sign({ id: id }));
            }
            if (!account.emails.includes(fb.data.email)) {
                account.emails.push(new entity.Account.Email({ address: fb.data.email }));
            }
        }
        const token = new entity.Token({ account, ip: params.ip });
        await new entity.Token.Storage(this.postgres).save(token);
        return token;
    }
}
namespace Create {
    export enum Error {
        BadPayload = 'BadPayload',
    }
    export type Parameter = internal.Parameter | facebook.Parameter;
    export namespace Parameter {
        export function is(v: any): v is Parameter {
            return internal.Params.is(v) || facebook.Params.is(v);
        }
    }
}

export default Create;
import Router from 'koa-router';
import pg from 'pg';
import Recaptcha2 from 'recaptcha2';
import Koa from 'koa';
import TokenCreate from './../../controller/token/Create';
import TokenDelete from './../../controller/token/Delete';
import AccountGet from './../../controller/account/Get';
import * as  entity from '../../entity';
import postgres from '../../component/postgres';

type Context = {
    postgres: pg.Pool
    recaptcha2: Recaptcha2
};
type State = {
    account: entity.Account
}
const router = new Router({
    prefix: '/v1',
    strict: true,
    sensitive: true,
});
export default router;
const publicRouter = new Router<{}, Context>({
    strict: true,
    sensitive: true,
});
const privateRouter = new Router<State, Context>({
    strict: true,
    sensitive: true,
});
privateRouter.use(
    async function (ctx, next) {
        const authorization: string = ctx.request.headers['authorization'] || ctx.throw(401);
        const id = authorization.split(' ')[1] || ctx.throw(401);

        const client = await ctx.postgres.connect();
        try {
            const token = (await new entity.Token.Storage(client).read({ filter: ['=', 'id', id] })).first()
            if (!token || token.isDeleted) return ctx.throw(401);
            ctx.state.account = token.account;
            await next();
        } finally {
            client.release();
        }
    }
)

namespace resource {
    export class Token {
        readonly id: string;
        constructor(token: entity.Token) {
            this.id = token.id;
        }
    }
    export class Account {
        readonly id: string;
        readonly name: string;
        readonly avatar: string | null;
        constructor(account: entity.Account) {
            this.id = account.id;
            this.name = account.name;
            this.avatar = account.avatar;
        }
    }
}

publicRouter.post('/token', async function (ctx) {
    try {
        const payload: TokenCreate.Parameter = ctx.request.body;
        const db = await postgres.transaction(ctx.postgres);
        const token = await new TokenCreate(db, ctx.recaptcha2).run(payload);
        ctx.body = new resource.Token(token);
    } catch (e) {
        if (e.message === TokenCreate.Error.BadPayload) return ctx.throw(400, e);
        throw e;
    }
});
privateRouter.delete('/token/:id', async function (ctx) {
    try {
        const db = await postgres.transaction(ctx.postgres);
        const token = await new TokenDelete(db).run({ id: ctx.params.id, account: ctx.state.account })
        ctx.body = new resource.Token(token);
    } catch (e) {
        if (e.message === TokenDelete.Error.NotFound) return ctx.throw(404, e);
        throw e;

    }
});
privateRouter.get('/account', async function (ctx) {
    try {
        const db = await postgres.connection(ctx.postgres);
        const account = await new AccountGet(db).run({ id: ctx.state.account.id });
        ctx.body = new resource.Account(account);
    } catch (e) {
        if (e.message === AccountGet.Error.NotFound) return ctx.throw(404, e);
        throw e;
    }
});
privateRouter.get('/account/:id', async function (ctx) {
    try {
        const db = await postgres.connection(ctx.postgres);
        const account = await new AccountGet(db).run({ id: ctx.params.id });
        ctx.body = new resource.Account(account);
    } catch (e) {
        if (e.message === AccountGet.Error.NotFound) return ctx.throw(404, e);
        throw e;
    }
});

router.use(publicRouter.routes(), publicRouter.allowedMethods());
router.use(privateRouter.routes(), privateRouter.allowedMethods());
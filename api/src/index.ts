import Koa from 'koa';
import json from 'koa-json';
import koaBody from "koa-body";
import cors from 'koa2-cors';
import { Pool } from "pg";
import router from "./router/v1";
import Recaptcha2 from 'recaptcha2';

type Context = {
    postgres: Pool,
    cache: Cache,
    recaptcha2: Recaptcha2,
}
const app = new Koa<any, Context>();

app.context.postgres = new Pool({
    host: 'postgres',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_USER,
});
app.context.postgres.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1)
});
app.context.recaptcha2 = new Recaptcha2({
    siteKey: process.env.RECAPTHCA2_APP_ID || '',
    secretKey: process.env.RECAPTHCA2_SECRET || '',
});

app.use(cors());
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = {
            status: ctx.status,
            message: err.message || null,
            date: new Date(),
        };
        ctx.app.emit('error', err, ctx);
    }
});
app.on('error', (err, ctx) => {
    console.error(err, " ctx: ", JSON.stringify(ctx, undefined, 0));
});
app.use(json());
app.use(koaBody());

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Listen :80");
app.listen(80);
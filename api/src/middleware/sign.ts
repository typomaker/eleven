import Koa from "koa";
import validator from "validator";

export async function create(ctx: Koa.Context) {
    try {
        await ctx.recaptcha2.validate(ctx.body.captcha);
    } catch (e) {
        ctx.throw(400, {
            captcha: ctx.recaptcha.translateErrors(e)
        })
    }
    ctx.assert(validator.isEmail(ctx.body.email), 400, {
        email: 'invalid'
    });
    ctx.assert(validator.isEmpty(ctx.body.password), 400, {
        password: 'required'
    });
    ctx.assert(validator.isLength(ctx.body.password, 6), 400, {
        password: 'short'
    });

    const conn = await ctx.postgres.connect();
    try {
        await conn.query('BEGIN');
        const profile = await conn.query('SELECT * FROM account.profile WHERE email=$1 LIMIT 1', [ctx.body.email]);
        if (profile.rowCount) {

        } else {

        }

    } finally {
        conn.release();
    }
}
import Router from 'koa-router';
import token from './token';

const router = new Router();
export default router;
router.use('/token', token.routes(), token.allowedMethods());
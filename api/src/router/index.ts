import Router from 'koa-router';
import v1 from './v1';

const router = new Router();
export default router;
router.use('/v1', v1.routes(), v1.allowedMethods());
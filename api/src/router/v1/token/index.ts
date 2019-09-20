import Router from 'koa-router';
import create from './create';

const router = new Router<{}, create.Context>({ strict: true, sensitive: true });
export default router;

router.post('/', create);
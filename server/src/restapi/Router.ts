import KoaRouter from "@koa/router";
import { resapi as cfg } from "../env";
import * as handler from "./handler";

export const router = new KoaRouter({ strict: true });
router.post("/sign", handler.signup());
router.delete("/sign", handler.authorize(), handler.signout());
router.get("/localization", handler.cache(cfg.cache), handler.language());
router.get("/localization/:language", handler.cache(cfg.cache), handler.dictionary());


export default router;
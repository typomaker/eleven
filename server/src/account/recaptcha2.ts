import Recaptcha2 from "recaptcha2";
import { recaptcha2 as cfg } from "../env";

export const recaptcha2 = new Recaptcha2(cfg);
export default recaptcha2;
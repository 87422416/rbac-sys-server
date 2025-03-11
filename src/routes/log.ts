import { captcha, login } from "../controllers/back-sys/log";
import router from "./router";
import Joi from "joi";
import validateInput from "../middlewares/validateInput";
import validateCaptcha from "../middlewares/validateCaptcha";
import validateToken from "../middlewares/validateToken";
import { whoami } from "../controllers/back-sys/log";
interface LoginBody {
  username: string;
  password: string;
  captcha: string;
}
const loginSchema = Joi.object<LoginBody>({
  username: Joi.string().required().min(1).max(20).label("用户名长度为1-20"),
  password: Joi.string().required().min(6).max(20).label("密码长度为6-20"),
  captcha: Joi.string().required().label("验证码必填"),
});
router.post("/login", validateInput(loginSchema), validateCaptcha, login);

router.get("/captcha", captcha);

router.get("/whoami", validateToken, whoami);

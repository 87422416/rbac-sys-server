import { login } from "@/controllers/back-sys/log";
import router from "./router";
import Joi from "joi";
import validateInput from "@/middlewares/validateInput";

interface LoginBody {
  username: string;
  password: string;
  capcha: string;
}
const loginSchema = Joi.object<LoginBody>({
  username: Joi.string().required().min(1).max(20).label("用户名长度为1-20"),
  password: Joi.string().required().min(6).max(20).label("密码长度为6-20"),
});
router.post("/login", validateInput(loginSchema), login);

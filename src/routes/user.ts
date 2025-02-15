import {
  createUser,
  deleteUsers,
  getUserById,
  getUsersByPage,
  updateUser,
} from "@/controllers/back-sys/user";
import router from "./router";
import validate from "@/middlewares/validateInput";
import Joi from "joi";
import validateToken from "@/middlewares/validateToken";
import validateInput from "@/middlewares/validateInput";
import { getIdObjectSchema, getIdsObjectSchema } from "@/utils";

interface UserBody {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
}
interface CreateUserBody extends UserBody {
  confirmPassword: string;
}

export const CreateUserObjectSchema = Joi.object<CreateUserBody>({
  username: Joi.string().required().min(1).max(20).label("用户名长度为1-20"),
  password: Joi.string().required().min(6).max(20).label("密码长度为6-20"),
  confirmPassword: Joi.equal(Joi.ref("password")).label(
    "确认密码必须与密码相同"
  ),
  email: Joi.string().optional().email().label("邮箱格式不正确"),
  phone: Joi.string()
    .optional()
    .regex(/^1[3-9]\d{9}$/)
    .label("手机号格式不正确"),
  avatar: Joi.string().optional().label("头像格式不正确"),
});
router.post(
  "/user",
  validateToken,
  validate(CreateUserObjectSchema),
  createUser
);

router.get("/users", validateToken, getUsersByPage);

router.get(
  "/user/:id",
  validateToken,
  validateInput(getIdObjectSchema(), "params"),
  getUserById
);

const PutUserObjectSchema = Joi.object<UserBody>({
  password: Joi.string().optional().min(6).max(20).label("密码长度为6-20"),
  email: Joi.string().optional().email().label("邮箱格式不正确"),
  phone: Joi.string()
    .optional()
    .regex(/^1[3-9]\d{9}$/)
    .label("手机号格式不正确"),
  avatar: Joi.string().optional().label("头像格式不正确"),
  status: Joi.string()
    .optional()
    .valid("active", "inactive", "locked")
    .label("状态不正确"),
});
router.put(
  "/user/:id",
  validateToken,
  validateInput(getIdObjectSchema(), "params"),
  validateInput(PutUserObjectSchema, "body"),
  updateUser
);

router.delete(
  "/users/:ids",
  validateToken,
  validateInput(getIdsObjectSchema(), "params"),
  deleteUsers
);

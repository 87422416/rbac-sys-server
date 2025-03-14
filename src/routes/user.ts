import {
  createUser,
  deleteUsers,
  getUserById,
  getUserRole,
  getUsersByPage,
  updateUser,
} from "../controllers/back-sys/user";
import router from "./router";
import validateInput from "../middlewares/validateInput";
import Joi from "joi";
import validateToken from "../middlewares/validateToken";
import { getIdObjectSchema, getIdsObjectSchema } from "../utils";
import validatePermission from "../middlewares/validatePermission";

interface UserBody {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
  unlockTime?: number;
  menu?: string[];
  roles?: string[];
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
  validateInput(CreateUserObjectSchema),
  validatePermission,
  createUser
);

router.get("/users", validateToken, validatePermission, getUsersByPage);

router.get(
  "/user/:id",
  validateToken,
  validateInput(getIdObjectSchema(), "params"),
  validatePermission,
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
  unlockTime: Joi.date().optional().label("解锁时间格式不正确"),
  menu: Joi.array().optional().label("菜单格式不正确"),
  roles: Joi.array().optional().label("角色格式不正确"),
});
router.put(
  "/user/:id",
  validateToken,
  validateInput(getIdObjectSchema(), "params"),
  validateInput(PutUserObjectSchema, "body"),
  validatePermission,
  updateUser
);

router.delete(
  "/users/:ids",
  validateToken,
  validateInput(getIdsObjectSchema(), "params"),
  validatePermission,
  deleteUsers
);

router.get(
  "/user/role/:id",
  validateToken,
  validateInput(getIdObjectSchema(), "params"),
  validatePermission,
  getUserRole
);

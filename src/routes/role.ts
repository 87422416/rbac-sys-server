import {
  createRole,
  deleteRole,
  getRoles,
  assignRoleToUser,
  revokeRoleFromUser,
  getUsersIdByRole,
  setRoleInheritance,
  getRolesInheritanceTree,
} from "../controllers/back-sys/role";
import router from "./router";
import validate from "../middlewares/validateInput";
import Joi from "joi";
import validateInput from "../middlewares/validateInput";
import validateToken from "../middlewares/validateToken";
import validatePermission from "../middlewares/validatePermission";
interface RoleBody {
  label: string;
}

router.get(
  "/roles/inheritance",
  validateToken,
  validateInput(Joi.object({ role: Joi.string().optional() }), "query"),
  validatePermission,
  (req, res, next) => {
    // #swagger.tags = ['role']
    const { role } = req.query; // swagger bug

    getRolesInheritanceTree(req, res, next);
  }
);

export const RoleObjectSchema = Joi.object<RoleBody>({
  label: Joi.string().required().min(1).max(20).label("角色名称1-20个字符"),
});

router.post(
  "/role",
  validateToken,
  validate(RoleObjectSchema),
  validatePermission,
  createRole
);

router.post(
  "/role/inheritance",
  validateToken,
  validateInput(
    Joi.object({
      role: Joi.string().required(),
      parentRole: Joi.string().required(),
    }),
    "body"
  ),
  validatePermission,
  (req, res, next) => {
    // #swagger.tags = ['role']
    const { role, parentRole } = req.body; // swagger bug

    setRoleInheritance(req, res, next);
  }
);

router.put(
  "/role/revoke",
  validateToken,
  validateInput(
    Joi.object({
      userId: Joi.number().required(),
      role: Joi.string().required(),
    }),
    "body"
  ),
  validatePermission,
  (req, res, next) => {
    // #swagger.tags = ['role']
    const { role, userId } = req.body; // swagger bug

    revokeRoleFromUser(req, res, next);
  }
);

router.delete(
  "/role/:role",
  validateToken,
  validateInput(
    Joi.object({ role: Joi.string().required().label("role格式不正确") }),
    "params"
  ),
  validatePermission,
  deleteRole
);

router.get("/roles", validateToken, validatePermission, getRoles);

router.post(
  "/role/assign",
  validateToken,
  validateInput(
    Joi.object({
      userId: Joi.number().required(),
      role: Joi.string().required(),
    }),
    "body"
  ),
  validatePermission,
  assignRoleToUser
);

router.get(
  "/role/users/:role",
  validateToken,
  validateInput(Joi.object({ role: Joi.string().required() }), "params"),
  validatePermission,
  (req, res, next) => {
    // #swagger.tags = ['role']
    const { role } = req.params; // swagger bug

    getUsersIdByRole(req, res, next);
  }
);

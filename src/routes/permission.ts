import validateToken from "../middlewares/validateToken";
import validateInput from "../middlewares/validateInput";
import router from "./router";
import Joi from "joi";
import {
  deletePermissionsByRole,
  getPermissionsByRole,
  getPermissions,
  setPermissionsByRole,
} from "../controllers/back-sys/permission";
import validatePermission from "../middlewares/validatePermission";

router.get("/permissions", validateToken, validatePermission, getPermissions);

router.post(
  "/permissions/:role",
  validateToken,
  validateInput(Joi.object({ role: Joi.string().required() }), "params"),
  validateInput(
    Joi.object({
      permissions: Joi.array().required(),
    }),
    "body"
  ),
  validatePermission,
  setPermissionsByRole
);

router.get(
  "/permissions/:role",
  validateToken,
  validateInput(Joi.object({ role: Joi.string().required() }), "params"),
  validatePermission,
  getPermissionsByRole
);

router.delete(
  "/permissions/:role",
  validateToken,
  validateInput(Joi.object({ role: Joi.string().required() }), "params"),
  validateInput(
    Joi.object({
      permissions: Joi.array().required(),
    }),
    "body"
  ),
  validatePermission,
  deletePermissionsByRole
);
